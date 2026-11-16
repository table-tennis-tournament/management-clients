# Test improvement plan

Goal: tests that compare **complete** results (whole objects, whole JSON bodies, whole events), so that
any unintended change breaks a test. This file is the handoff between sessions: what is done, what was
found on the way, and what to do next.

## Status

| Step | What | State |
|------|------|-------|
| 1 | Deterministic test data: clean database per test, fixed ids | Done, `92d48024` |
| 2 | Expected-JSON files for every REST read endpoint and every WebSocket event | Done for the backend, `694be63f` |
| 3 | Whole-object equality for domain events, `TournamentMatch` and database rows | Open |
| 4 | Fix or delete tests that cannot fail | Partly done |
| 5 | Mutation testing (PIT) on the `domain` packages | Open |
| 6 | Frontend: strengthen unit tests, reuse the backend expected files as fixtures | Open |

## How the backend tests work now

All in `management-backend/src/test/kotlin/de/ttt/management/`:

- **`DatabaseHelper`** (`@Import(DatabaseHelperConfiguration::class)`, then inject it): `clean()` truncates every
  table except Flyway's history and restarts the id sequences and the UUID sequence. The `insert…` methods add
  rows; `insertSingleOpenMatch()` is the shared minimal scenario. Every IT calls `db.clean()` in `@BeforeEach`
  and inserts only what it needs. The seed migration `V100__test_data.sql` is gone.
- **`DeterministicTestConfiguration`** (imported by `DatabaseHelperConfiguration`): a fixed `Clock`
  (2026-11-16 10:00 Europe/Berlin, `NOW`) and a `SequentialIdGenerator` (`00000000-…-000000000001`, `…002`).
  Production code gets both from `ClockAndIdConfig` (`Clock`, `IdGenerator` beans).
- **`ExpectedJson`**: `expectJson("<name>")` / `assertMatches(...)` compare with
  `src/test/resources/expected/<name>.json` in JSONAssert STRICT mode; `expectExactJson("...")` compares with
  inline JSON. Re-record after an intended change and **review the diff**:
  `./mvnw test -DupdateExpected=true && git diff src/test/resources/expected`.
- **`StompTestSupport.assertNextEvent(messages, topic, name)`**: compares the raw envelope of the next
  WebSocket message with `expected/events/<topic>/<name>.json`.
- **Coverage:** `TournamentReadModelIT` (every tournament read endpoint, one match in every state),
  `TableModuleIT`, `RegistrationModuleIT`, `SettingsModuleIT`, `UpdateTopicsIT` (all 16 event types).

Pitfalls learned:

- `mgmt_matchtable` rows also take UUIDs: every assign or start onto a new table consumes one, so the queue
  UUID in a test is not always `…0001` (see `TournamentModuleIT`, `TournamentReadModelIT`).
- `TRUNCATE` commits in H2, so ITs must not be `@Transactional` around `clean()`.
- In-memory state survives between tests that share a Spring context: the auto-start flag
  (`MatchListService.setMatchListActive`, reset in `TournamentModuleIT`/`TournamentReadModelIT`) and the selected
  printer (`PrinterService`, cannot be unset, so the test that sets it uses `@DirtiesContext(AFTER_METHOD)`).
- After deleting or renaming test classes run `mvn clean test`; stale classes in `target/` keep running.
- Random order check: `mvn test '-Djunit.jupiter.testmethod.order.default=org.junit.jupiter.api.MethodOrderer$Random'
  '-Djunit.jupiter.testclass.order.default=org.junit.jupiter.api.ClassOrderer$Random'`.

## Findings (todos)

Current behaviour that the expected files now pin. Decide for each whether it is intended; if you change it,
re-record the affected files.

1. **`GET /match/{id}` always returns `isPlayable: false`.** `JdbcTournamentMatchRepository.findById` skips
   `withPlayability`, which every list endpoint applies. Looks like a bug
   (`expected/tournament/match-4.json`).
2. **The match `winner` has only an id.** `firstName`, `lastName`, `ttr` are null, while the team players
   have names (`expected/tournament/match-all.json`, match 3). `resolvePlayers` does not resolve the winner.
3. **The doubles discipline is named inconsistently.** `/types/all` says "Herren-Doppel" (`withDoubleName`),
   the table manager `classification` and the caller `discipline.name` say "Herren".
4. **`MATCH_CALLED` payload repeats discipline ids** (`typeIds: [1, 1, 1]` for three matches); the scope
   deduplicates them. `MatchService.calledEvent` and `takenBackEvent` map without `distinct()`
   (`expected/events/matches/match-called-bulk.json`).
5. **`MATCH_STARTED.previousTableId` equals `tableId`** when a match starts on the table it was assigned to.
   Clients may read this as "moved" (`expected/events/matches/match-started.json`).
6. **The selected printer cannot be unset.** `PrinterService.selectedPrinter` is in-memory with no reset; the
   settings endpoint exposes it. Tests work around it with `@DirtiesContext`.
7. **`StompTestSupport.subscribe` sleeps 300 ms** because the simple broker sends no receipts. A possible source
   of flakiness on slow CI machines.

## Next steps

### Step 3: whole-object equality in the backend

- `TournamentModuleTest` and `RegistrationModuleTest`: replace `hasSize(1)` plus single-field checks with
  `assertThat(events.ofType(X::class.java)).containsExactly(X(...))` (all events are data classes). Only
  `RegistrationModuleTest` does this so far.
- `TournamentMatchTest`: `TournamentMatch` is a plain class without `equals`. Use AssertJ
  `assertThat(match).usingRecursiveComparison().isEqualTo(expected)` with a complete expected match per
  test, instead of a few fields (e.g. "completes a match" never checks `tableId`, `callState`,
  `waitingList`). Pass `now = …` explicitly; `assign`/`start` have no default time any more.
- `JdbcTournamentMatchRepositoryIT`: compare the whole `matches` row (`queryForMap`) and the whole
  `mgmt_matchtable` / `mgmt_match_call_state` rows instead of re-reading through the repository.
- `TournamentModuleIT` state checks after a POST (`assertTrue(freed.isKampflos)`, …): compare the whole
  match, or the `GET /match/{id}` body with an expected file.
- `GroupingModuleIT`: already compares the relevant columns; extend to all `playerpergroup` columns written
  by `JdbcPlayerPerGroupRepository.save`.

### Step 4: tests that cannot fail (remaining)

- `TournamentModuleIT` "should take back matches successfully" takes back a match that is already open.
  Assign or start it first, then check the match.
- "should fail to stop a match that is not playing" uses the unknown id 9999; use an existing match that
  is not playing.
- "should start a match", "should free matches", "should set result" only check `{"success": true}`;
  also check the resulting match (or merge with the existing state tests).
- `PrinterModuleIT` "should set print on start" never reads the setting back; check `GET /settings/all`.
- Error bodies of `PrinterController` and the player endpoints are not compared yet (status only).

### Step 5: mutation testing

Add `pitest-maven` with the Kotlin plugin to `management-backend/pom.xml`, scoped to
`de.ttt.management.*.domain.*` and the unit tests, and look at surviving mutants in `TournamentMatch`,
`AutoStartHeuristic`, `GroupStandingsCalculator`, `SetResult`.

### Step 6: frontend

- admin-view effects: 20 error-path tests assert only `result.type`; compare the whole action
  (`toEqual(new XError(...))`) and restore the commented-out toast assertions.
- No effect test checks the arguments the service was called with; add `toHaveBeenCalledWith(...)`.
- No service has an `HttpTestingController` test; URLs and request bodies are only covered by e2e.
- result-view uses Vitest: switch `toEqual` to `toStrictEqual` (catches `undefined` properties and class
  types). Its only component test is "should create".
- Reuse the backend expected files as fixtures (e.g. replace the hand-written event list in
  `admin-view/src/app/websocket/admin-updates.service.spec.ts` with `expected/events/**`). Needs a way to
  import JSON from outside each app (tsconfig `include`/`resolveJsonModule`, or copying the files in a
  pre-test script).
- Leave the Playwright e2e tests on visibility/text checks.
