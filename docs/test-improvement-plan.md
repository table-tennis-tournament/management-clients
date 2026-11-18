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
| 6 | Frontend: strengthen unit tests, reuse the backend expected files as fixtures | Done |

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
- **One REST test class per root resource:** `MatchResourceIT` for `/api/v2/match`, `MatchListResourceIT`,
  `MatchAggregatesResourceIT`, `PlayerCallResourceIT`, `TypesResourceIT`, `TableResourceIT`, `TablesResourceIT`,
  `TestSocketResourceIT` (tournament), `PlayersResourceIT`, `DisciplinesResourceIT` (registration),
  `SettingsResourceIT`, `PrinterResourceIT` (settings). They have no base class: each imports `ResourceTestConfiguration`, which
  provides the injected helpers `Api` (the `/api/v2` calls and `expectMatch`), `TestState` (`reset()` empties the
  database and restores the in-memory settings; every class calls it first in its `@BeforeEach`) and `Scenarios`
  (`givenOpenMatches()`, `givenMatchesInEveryState()`, `givenTwelveTables()`). A class that needs two scenarios
  has one `@Nested` class per scenario. Their expected
  files live in `expected/<resource>/`. All of them share one Spring context.
- **No real printing:** `RecordingPrinterGateway` replaces the `lpr` gateway in every integration test (it knows
  the printers "PDF" and "Office") and records the jobs, so `PrinterResourceIT` checks what was printed where.
- **Other integration tests:** `UpdateTopicsIT` (all 16 event types), `MatchLifecycleScenarioIT`,
  `MatchLifecycleOutboundIT`, `TournamentOutboundIT`, `WebSocketHeartbeatIT`, `OpenApiIT`,
  `JdbcTournamentMatchRepositoryIT`, `GroupingModuleIT`.

Pitfalls learned:

- `mgmt_matchtable` rows also take UUIDs: every assign or start onto a new table consumes one, so the queue
  UUID in a test is not always `…0001` (see `MatchListResourceIT`).
- `TRUNCATE` commits in H2, so ITs must not be `@Transactional` around `clean()`.
- In-memory state survives between tests that share a Spring context: the auto-start flag, print on assign and
  the selected printer. `TestState.reset()` restores all three.
- Recording (`-DupdateExpected=true`) never fails: a test that compares two responses with the same file only
  overwrites it. Run the tests once more without the flag after recording.
- After deleting or renaming test classes run `mvn clean test`; stale classes in `target/` keep running.
- Random order check: `mvn test '-Djunit.jupiter.testmethod.order.default=org.junit.jupiter.api.MethodOrderer$Random'
  '-Djunit.jupiter.testclass.order.default=org.junit.jupiter.api.ClassOrderer$Random'`.

## Findings (resolved)

Behaviour the expected files pinned, and how it was decided:

1. **`GET /match/{id}` always returned `isPlayable: false`.** Fixed: every query, `findById` included, computes
   playability against all matches on a table, not only the loaded ones, so a player on a table in one
   discipline blocks their matches in all others.
2. **The match `winner` had only an id.** Fixed: `TournamentMatch` keeps the stored side ids (`side1Id`,
   `side2Id`) and the winning side id (`winnerSideId`, written to `matc_winner_id` as mktt does: the player id,
   or `100000 + double id` for doubles; it stored the first player of a doubles side before). `winner` is the
   winning side's players with names.
3. **The doubles discipline was named inconsistently.** Fixed: `TournamentDiscipline.fromStored` names a doubles
   discipline "Herren-Doppel" for every endpoint and every match.
4. **Event scopes repeated discipline and table ids.** Fixed: every multi-match event carries each id once.
5. **`MATCH_STARTED.previousTableId` equalled `tableId`.** Fixed: `previousTableId` is only set when the match
   came from another table (assign and start).
6. **The selected printer could not be unset.** Fixed: `DELETE /api/v2/printer/set` goes back to the default
   printer.
7. **`StompTestSupport.subscribe` slept 300 ms.** Fixed: it waits until the simple broker's subscription
   registry holds the new subscriptions.
8. **Taking back a completed match kept its result.** Fixed: take back (and stop, remove) clears the result and
   the start time; the match is played again from the start.
9. **The `mgmt_matchtable` timestamp ignored the `Clock`.** Fixed: it is written from the injected `Clock`.
10. **Fixed: admin-view read `successful`, the backend sends `success`.** Every successful assignment from
   admin-view dispatched `AssignMatchToTableError` with an empty error toast. `StatusDto` now declares `success`;
   `table.effects.spec.ts` has the regression test.

## Next steps

### Steps 3 and 4: done

`TournamentModuleTest` compares whole events; `TournamentMatchTest` compares the whole match after every
transition; `JdbcTournamentMatchRepositoryIT` compares whole `matches`, `mgmt_matchtable` and
`mgmt_match_call_state` rows; `MatchResourceIT` and its neighbours compare `GET /match/{id}` with
`expected/match/after-*.json` after every state change (take back now starts and calls the match first,
"stop a match that is not playing" uses an open match); `GroupingModuleIT` compares every `playerpergroup`
column `save` writes; `PrinterResourceIT` reads print-on-assign back from `/settings/all`; the error bodies of
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

### Step 6: frontend (done)

- **One unit test framework: Vitest** in all three clients (Analog's Vite plugin for Angular, `vite.config.ts`,
  `src/test-setup.ts`, `tsconfig.spec.json`), plus Playwright for e2e. Karma, Jasmine and Protractor are gone.
  Vitest strips types without checking them, so each client has `npm run test:types`
  (`tsc -p tsconfig.spec.json --noEmit`). CI runs `test:types` and `test-ci` for every client before its e2e tests.
- **Effects:** `emittedBy(effect, actions, action)` (`admin-view/src/app/testing/effects-testing.ts`) completes the
  action stream and returns every emitted action; specs compare it with `toStrictEqual`, plus the service
  arguments (`mock.calls`) and the toast messages. This found `callMatch` emitting `CallMatchSuccess` and
  `LoadCallerMatches`, which the old spec could not see.
- **Services:** `describeRequests(Service, cases)` (`admin-view/src/app/testing/http-testing.ts`, excluded from the
  app build) pins method, URL, body and the mapped response of every HTTP call with `HttpTestingController`.
- **Backend fixtures:** `admin-updates.service.spec.ts` imports every `expected/events/**` envelope (relative path,
  `resolveJsonModule`) and checks the exact reloads per event, and that admin-view handles exactly the backend's
  event types.
- The shared `result-entry` and `match-state` specs (identical copies in all clients) keep `toEqual`; switch all
  three copies together if wanted. The result-view component test ("should create") stays until result-view gets
  live updates (`docs/follow-ups.md` 4).
- Leave the Playwright e2e tests on visibility/text checks.
