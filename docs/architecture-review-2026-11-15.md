# Architecture review, 2026-11-15

Scope: `management-backend` (Kotlin/Spring) and the three Angular clients (`admin-view`, `tablemanager-view`, `result-view`), on branch `boot-migration`. The review looks for *deepening opportunities*: modules whose interface is nearly as complex as their implementation, or whose rules are spread over several places.

Vocabulary: **module** (anything with an interface and an implementation), **interface** (everything a caller must know), **deep** / **shallow**, **seam** (where an interface lives), **adapter** (what fills a seam), **leverage** (what callers gain), **locality** (what maintainers gain). Domain terms follow `GLOSSARY.md`.

The defects listed below were found by reading the code. None of them were reproduced.

| # | Candidate | Strength |
|---|-----------|----------|
| 1 | Deepen the Match lifecycle module | Strong (done) |
| 2 | One Result entry module for the clients | Strong (done) |
| 3 | One answer to "what state is this Match in?" | Worth exploring |
| 4 | A shared Update event module for the clients | Worth exploring |
| 5 | Collapse admin-view's command plumbing | Speculative |

**Top recommendation: candidate 1.** It is the most-changed code in the repo, its copies have already drifted into defects, and it makes candidate 3 and follow-up 6 (stop → take back) small.

---

## 1. Deepen the Match lifecycle module (Strong)

**Status: done.** `TournamentMatch` owns every transition, `TournamentMatchRepository.save(match)` replaced the ten write methods, and `MatchService` derives event scopes from the table before the transition. Covered by `TournamentMatchTest` and `JdbcTournamentMatchRepositoryIT`.

**Files** (under `management-backend/src/main/kotlin/de/ttt/management/tournament/`)
- `domain/TournamentMatch.kt` (197 lines)
- `application/MatchService.kt` (320 lines)
- `domain/TournamentMatchRepository.kt` (23 methods)
- `infrastructure/database/JdbcTournamentMatchRepository.kt` (380 lines)
- `application/MatchListService.kt`, `application/TableService.kt`

**Problem.** Each transition is written three times: the field changes in `TournamentMatch`, the orchestration and hand-built update event in `MatchService`, and a dedicated `UPDATE` statement in the repository (`assignMatch`, `startMatch`, `stopMatch`, `removeFromTable`, `freeMatch`, `takeBackMatch`, `setWaitingList`, `updateCallState`, `updatePartialResult`, `completeResult`). The service mutates the Match, throws it away, and then the SQL restates the same rule. The copies have drifted:

- `stopMatch` never calls the Match. It also leaves the call state and the `mgmt_matchtable` row in place, which `removeFromTable` clears for what the glossary calls the same Take back.
- `takeBack()`, `free()` and `complete()` keep `tableId` in memory, while their SQL sets `matc_tabl_id = NULL`. So the in-memory state after the transition is wrong. Event scopes depend on this today: they need the *previous* table.
- `startMatch` writes no `mgmt_matchtable` row, but `assignMatch` does.
- Every bulk operation (`freeMatches`, `takeBackMatches`, `callMatches`, `removeMatchesFromTable`) repeats the same loop: load, mutate, write, track `allSuccess`, collect, publish.

**Solution.** The Match decides each transition. The repository persists whatever state the Match holds (`load`, `save(match)`, finders), and the sidecar tables from ADR-0001 stay inside the adapter. The update event and its scope are derived from the state before and after the transition, not assembled by hand in each method.

**Wins**
- Locality: a transition changes in one module.
- The interface shrinks from 10 write methods to `save`.
- `TournamentMatchTest` covers what actually gets persisted.
- Follow-up 6 (rename stop to take back) falls out of it.
- Event scope can no longer drift from the transition.

**Testing.** The adapter can be swapped for H2 (already used by the `*IT` tests). The domain tests then become the main test surface, and the ITs only check the mapping.

---

## 2. One Result entry module for the clients (Strong)

**Status: done.** Each client has an identical copy of `src/app/shared/result-entry/result-entry.ts` and its spec (one copy per app, by decision; keep the copies identical). `ResultCheckerService`, `GameService` and the two hand-written pipes and formatters are gone; modals, dialogs, pipes and `tt-table` call the module. The cancelled-modal dispatches are guarded.

**Files**
- `admin-view/src/app/table/table-list/result-modal/result-checker.service.ts` (57 lines), `result-modal.component.ts`
- `admin-view/src/app/shared/pipes/result.pipe.ts`
- `tablemanager-view/src/app/table-list/tt-table/game.service.ts` (78 lines), `result-dialog/result-dialog.component.ts`, `tt-table.component.ts`
- `result-view/src/app/result/result.pipe.ts`

**Problem.** The Set and Match-winning rules (11 Points with a lead of two, best of five) and the shorthand input (`"5"` means 11:5, `"-5"` means 5:11) are implemented separately in each app, on two different data shapes:

- The shorthand parser exists twice: `ResultCheckerService`, which validates and has the only result spec (72 lines), and `GameService`, which does no validation and has no test.
- Formatting Sets back into input text exists twice: `result-modal.component.ts:55-64` and `result-dialog.component.ts:24-31`.
- The set-count pipes exist twice: admin reads `{pointsPlayer1, pointsPlayer2}`, result-view reads `element[0] > element[1]`.
- The v2 backend sends `result = "3 : 1"` (a string) and puts the per-set points in `sets`. `result-modal.component.ts:57-58` and the result-view pipe still call array methods on `result`, so they throw. The test fixtures (`shared/data/match.test.data.ts`) still use tuple arrays.
- `tt-table.component.html` calls `playerWonMatch` 8 times from the template.
- `result-list` imports `ResultCheckerService` from inside the `table/` feature.
- Three callers dispatch `ResultForMatch` without checking whether the modal was cancelled (`table-list.page.component.ts:161`, `supervisor.page.component.ts:89`, `result-list.page.component.ts:46`).

**Solution.** Each client calls one pure Result entry module, either shared source or one copy per app. Its interface is: text ⇄ Sets, sets won per Side, winner, and whether a result is valid. Modals, dialogs, pipes and templates call it instead of computing results themselves.

**Wins**
- Leverage: one interface serves six call sites.
- Locality: the Set rules are fixed in one place.
- The existing 72-line spec grows to cover all three apps.
- Templates stop computing winners.

---

## 3. One answer to "what state is this Match in?" (Worth exploring)

**Files**
- backend: `TournamentMatch.state`, `TableController.legacyState`, `MatchState.kt`, `CallState`
- `admin-view/src/app/shared/data/matchstate.model.ts`, plus about 25 comparison sites in `supervisor/discipline-view/*`, `assign/discipline-match-list`, `result/result-list`, `caller/*`
- `result-view/src/app/result/data/matchstate.model.ts`, `services/discipline-tab.service.ts`
- `tablemanager-view/src/app/table-list/tt-table/tt-table.component.ts`

**Problem.** The lifecycle from the glossary exists in four vocabularies:

- Backend `state`: `Open | InQueue | OnTable | Started | Completed | Finished`.
- Backend `legacyState`, used only for the tablemanager DTO: adds `Callable`, `SecondCall`, `ThirdCall` and `InWaitingList`.
- The admin-view enum (with `InQueue` and the call states) and the result-view enum (with `InWaitingList` and no `Started`) differ from each other and from what the backend sends.
- tablemanager-view uses string literals.

Components compare names through `MatchState[MatchState.X]` at about 30 sites, and they disagree on whether *Finished* (walkover) counts as over. This is the root of `docs/follow-ups.md` item 1.

**Solution.** The backend derives the state once, along with the Call count, and puts it on every Match DTO; `legacyState` goes away. Each client gets a small module of state questions (`isWaiting`, `isAtTable`, `isBeingPlayed`, `isOver`, `callNumber`) that components call instead of comparing names.

**Wins**
- Locality: renaming a state touches one file.
- `legacyState` and one enum copy are deleted.
- The predicates can be tested without components.
- It pairs naturally with candidate 1.

---

## 4. A shared Update event module for the clients (Worth exploring)

**Files**
- `admin-view/src/app/shared/websocket.service.ts` (87 lines), `websocket/websocket.handler.service.ts`, `websocket/redux/*` (about 95 lines)
- `tablemanager-view/src/app/services/websocket.service.ts` (85 lines), `table-list/update-events.ts`
- `result-view`: nothing yet (follow-up 4)

**Problem.** The ADR-0003 rules (Scope filtering, coalescing, Resynchronization on reconnect) are implemented twice, and the two implementations behave differently:

- The STOMP transport is a verbatim copy. Only a method name differs.
- admin-view coalesces per reload target (`groupBy` + `auditTime(200)`) and ignores `scope` completely. It re-fetches up to six lists on every `MATCH_*` event.
- tablemanager-view filters by Scope but uses a single `auditTime`.
- admin-view connects through an ngrx action, effect and reducer whose `connected` flag never turns false, and whose selector has no consumer.
- Neither transport has a test.
- result-view will need a third copy.

**Solution.** One module owns connecting, resubscribing, Scope filtering, coalescing and Resynchronization. Each app only declares which reload belongs to which event on which Topic. A STOMP adapter runs in production and an in-memory adapter in tests, so the seam has two real adapters.

**Wins**
- Leverage: wiring up result-view becomes a table.
- admin-view gets Scope filtering for free.
- The admin ngrx connect triple is deleted.

**Note.** The three clients are separate npm projects, so this needs a way to share source between them (a path alias or a small workspace library). It is consistent with ADR-0002 and ADR-0003.

---

## 5. Collapse admin-view's command plumbing (Speculative)

**Files**
- `admin-view/src/app/table/redux/*` (actions 247 lines, effects 224), `settings/redux/*`, `caller/redux/*`, `supervisor/redux/*`
- `admin-view/src/app/table/table-list.page.component.ts` (188 lines)

**Problem.** A single command passes through six thin modules: page component, action class (`payload: any`), effect (call → Success | toast + Error), HTTP pass-through, optimistic reducer case, and finally the update-event re-fetch, which overwrites the optimistic result anyway. In total that is about 108 actions and 44 effects, mostly the same shape.

The page component branches single-Match vs multi-Match in five handlers. `onRemoveFromTable` (lines 95-99) dispatches `TakeBackTable` for a single Match instead of `RemoveMatchFromTable`, which looks like a bug.

**Solution.** Commands become one module that calls the backend and reports failure. The store keeps only loaded state, which arrives through update events.

**Wins**
- The optimistic reducer cases are deleted.
- Single-vs-multi branching lives in one place.
- Tests assert command → request once.

**Note.** This is large and not urgent, and it would replace about 860 lines of effect specs. Do it only after candidate 4.

---

## Test coverage snapshot

**Backend:** about 2,200 lines of tests. There are domain tests for `TournamentMatch`, `SetResult`, `AutoStartHeuristic` and `GroupStandingsCalculator`, plus module ITs against H2 and STOMP outbound ITs.

**admin-view:** 19 Karma specs, about 1,690 lines, covering effects, reducers, the websocket handler, `ResultCheckerService` and `DisciplineTabService`. It has no component, pipe or HTTP-service specs.

**tablemanager-view:** 4 specs, 227 lines. `GameService`, `tt-table` and the dialogs are untested.

**result-view:** 1 trivial "should create" spec.

**Untested core logic:**
- ~~`GameService`~~, ~~both result pipes~~ (replaced by `result-entry`, see candidate 2)
- result-view `DisciplineTabService` (about 90% the same as the admin copy)
- the admin component state predicates
- ~~the result-modal input formatting~~ (`formatResult`)
- both STOMP transport services
