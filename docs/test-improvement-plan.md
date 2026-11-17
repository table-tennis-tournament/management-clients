# Test improvement plan

Goal: tests that compare **complete** results (whole objects, whole JSON bodies, whole events), so that
any unintended change breaks a test. This file is the handoff between sessions: what is done, what was
found on the way, and what to do next.

## Status

| Step | What | State |
|------|------|-------|
| 1 | Deterministic test data: clean database per test, fixed ids | Done, `92d48024` |
| 2 | Expected-JSON files for every REST read endpoint and every WebSocket event | Done for the backend, `694be63f` |
| 3 | Whole-object equality for domain events, `TournamentMatch` and database rows | Done |
| 4 | Fix or delete tests that cannot fail | Done |
| 5 | Mutation testing (PIT) on the `domain` packages | Done |
| 6 | Frontend: strengthen unit tests, reuse the backend expected files as fixtures | Done for admin-view |

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
  `mvn test -DupdateExpected=true && git diff src/test/resources/expected` (there is no Maven wrapper).
- **`expectExactJsonIgnoring(json, "timestamp")`**: like `expectExactJson`, but the values at the given paths
  may differ (Spring's default error body carries a timestamp).
- **Whole objects elsewhere:** domain events with `containsExactly(Event(...))`; `TournamentMatch` with
  `assertMatch(match) { <changed fields> }` (AssertJ recursive comparison against a fresh match);
  database rows with `queryForMap` against the row before plus the changed columns
  (`JdbcTournamentMatchRepositoryIT`). Type expected maps as `mapOf<String, Any?>(...)`: without it Kotlin
  turns `1` into a `Long` when the same map holds a `1L`, and the maps are not equal.
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
8. **Taking back a completed match keeps its result.** `TournamentMatch.takeBack()` clears the winner, the
   table and the call, but `sets`, `sets1/2`, `balls1/2`, `result` and `resultRaw` stay, so an Open match can
   show "3 : 0" (`TournamentMatchTest` "takes a match back to the open state"). Stop, remove and take back
   also keep `startTime` (`expected/tournament/after-take-back.json`).
9. **The `mgmt_matchtable` timestamp ignores the `Clock`.** `JdbcTournamentMatchRepository.insertMatchTable`
   writes the database's `CURRENT_TIMESTAMP`, so tests cannot pin it and leave the column out.
10. **admin-view reads `successful`, the backend sends `success`.** `StatusDto` declares `successful`, every
   backend endpoint answers `{"success": ...}`. `TableEffects.assignMatchToTable` checks
   `status.successful === true`, so every successful assignment from admin-view dispatches
   `AssignMatchToTableError` and shows an empty error toast. `table.effects.spec.ts` still uses the declared
   shape; fix the DTO (or the effect) and that fixture together.

## Next steps

### Steps 3 and 4: done

`TournamentModuleTest` compares whole events; `TournamentMatchTest` compares the whole match after every
transition; `JdbcTournamentMatchRepositoryIT` compares whole `matches`, `mgmt_matchtable` and
`mgmt_match_call_state` rows; `TournamentModuleIT` compares `GET /match/{id}` with
`expected/tournament/after-*.json` after every state change (take back now starts and calls the match first,
"stop a match that is not playing" uses an open match); `GroupingModuleIT` compares every `playerpergroup`
column `save` writes; `PrinterModuleIT` reads print-on-start back from `/settings/all`; the error bodies of
`PrinterController` and the player endpoints are compared.

### Step 5: mutation testing (done)

Run on demand (not bound to `mvn test`):
`mvn test-compile org.pitest:pitest-maven:mutationCoverage`, report in `target/pit-reports/index.html`.
`pitest-maven` 1.30.2 with `pitest-junit5-plugin`, scoped to `de.ttt.management.*.domain.*` and the
`*.domain.*Test` unit tests. The commercial Arcmutate Kotlin plugin is not used; PIT's built-in Kotlin junk
filter plus `excludedMethods` (data class members) keep the noise down.

Result: test strength 68% → 78% after strengthening `GroupStandingsCalculatorTest` (whole standings, tie on
points, matches won before set difference, unplayed matches), `AutoStartHeuristicTest` (unknown match, grouped
entry, doubles, queue order) and `TournamentMatchTest` (undecided 0:0 set, `isPlayableAgainst`). Remaining
survivors in `TournamentMatch`, `AutoStartHeuristic`, `GroupStandingsCalculator`, `SetResult` were reviewed:

- `TournamentMatch` getters: `assertMatch` compares fields, not getters. Trivial accessors, left alone.
- Mutants on lines past the end of a file are Kotlin's inlined `count`/`all`/`any` bodies (the
  `is Collection && isEmpty()` shortcut, overflow checks): equivalent.
- `AutoStartHeuristic.selectNext` `imp.position > entry.position`: dead code, `filterFirst` already removed
  every later entry that shares a player with an earlier one. Could be deleted.
- `GroupStandingsCalculator` `sets1 > sets2` boundary: only differs for a played 0:0 match, which cannot occur.
- `SetResult.fromResultRaw` early `return emptyList()`: equivalent.
- "No coverage" (108): domain data classes of registration, settings and table, only exercised by the Spring
  ITs, which are not in `targetTests` (too slow per mutant).

### Step 6: frontend (done for admin-view)

- **admin-view unit tests run again.** The `test` target pointed to a missing `src/test.ts` and the app
  tsconfig, so no Karma spec ran. It now uses `src/tsconfig.spec.json` and `zone.js/testing`. Run with
  `CHROME_BIN=<chromium> npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox` (Playwright's Chromium
  works). CI only runs `format:check` for admin-view; the unit tests are not in CI yet.
- **Effects:** `emittedBy(effect, actions, action)` (`src/app/testing/effects-testing.ts`) completes the action
  stream and returns every emitted action, so specs compare the whole output, the service arguments
  (`spy.calls.allArgs()`) and the toast messages. Jasmine is 2.99 (no `toHaveBeenCalledOnceWith`). This found
  `callMatch` emitting `CallMatchSuccess` and `LoadCallerMatches`, which the old spec could not see.
- **Services:** `describeRequests(Service, cases)` (`src/app/testing/http-testing.ts`, excluded from the app
  build) pins method, URL, body and the mapped response of every HTTP call with `HttpTestingController`.
  All URLs were checked against the backend mappings.
- **Backend fixtures:** `admin-updates.service.spec.ts` imports every `expected/events/**` envelope (relative
  path, `resolveJsonModule`) and checks the exact reloads per event, and that admin-view handles exactly the
  backend's event types.
- **Not done, on purpose:** `toStrictEqual` in result-view. Its only Vitest specs are the shared
  `result-entry` and `match-state` specs, which are identical copies in all three clients and also run under
  Jasmine in admin-view, where `toStrictEqual` does not exist. The result-view component test ("should
  create") stays until result-view gets live updates (`docs/follow-ups.md` 4); a real test now would pin the
  known defects there (`typeId: 8`, tab reset).
- Leave the Playwright e2e tests on visibility/text checks.
