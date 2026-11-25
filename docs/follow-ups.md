# Follow-ups found during the live-update analysis

These issues are not caused by the WebSocket (STOMP) migration. They were found while analysing why updates do not reach the clients. They influence what a client sees after a re-fetch, but they are tracked separately from the live-update work (ADR 0003) and must not be mixed into it.

## 1. Match state mismatch in admin-view

Resolved by architecture review candidate 3: the clients use the backend `MatchState` names plus `callNumber` through `shared/match-state`, and `TableController.legacyState` is gone. The admin result list lists *Finished* matches, which is how freed ("Frei") matches wait for their result; unplayed matches are *Walkover* and are not listed.

## 2. Tablemanager DTO mismatches

Resolved: `Table` declares `table_id`, `table_number` and `table_manager_id` as numbers, the backend sends each player's club, the player dialog's ids reach `POST /playercall/{matchId}`, and the navigation lists table managers 1-5 like the routes.

## 3. Standalone Dockerfiles and nginx configs

Resolved: the per-app `Dockerfile`s, their `my_server_block.conf` and `admin-view/docker-compose.yml` were unused and broken, and are deleted. All clients ship in the image built from `Dockerfile-clients` with the root `my_server_block.conf`.

## 4. result-view

Resolved: result-view follows the `matches` topic with its own copy of `src/app/shared/update-events/` and the config `src/app/updates/result-updates.ts`; it reloads the displayed discipline when one of its results changes. The selected discipline lives in the store (`selectedTypeId`), so reloads keep the tab, the hardcoded `loadMatches({typeId: 8})` is gone, and `team-item` shows the club the backend now sends. `e2e/live-updates.spec.ts` checks a result entered elsewhere appears without reloading. The result components use `OnPush` and track groups and matches, so a reload keeps the rendered cards.

## 5. PlantUML diagrams

Resolved: `container.puml` and `backend-components.puml` show the Kotlin/Spring Boot backend, its Spring Modulith modules, the domain events between them and the STOMP topics; arc42 chapters 1, 2, 5 and 7 no longer describe the Scala/Play backend.

## 6. Rename "stop" to "take back"

Resolved: the table manager's "Zurück" calls `POST /api/v2/match/takeBack/{id}`, which maps to `MatchService.takeBackRunningMatch`. The deprecated alias `POST /api/v2/match/stop/{id}` shipped in v8.0.0-alpha and v8.0.2-beta and is removed (`MatchResourceIT` checks it is not found).

## 7. Group standings in result-view

Resolved: `GET /api/v2/groups/standings/{typeId}` (`grouping` module, `GroupsResourceIT`) returns each group's rows by place. result-view loads them with the matches, names each side by the players of its matches (`side1Id`/`side2Id`) and shows a standings table above each group's matches; it shows the matches alone when the standings do not load. No new event: the standings are written in the transaction of the result, before its update event reaches result-view.

## 8. Other open items

All resolved:

- Playwright 1.65.1 installs its browsers on Ubuntu 26.04 (the sandbox and GitHub's `ubuntu-latest`); the e2e suites of all three clients pass locally and run in CI.
- `MATCH_LIST_CHANGED` names the queued matches, those just added to or removed from the queue, and their disciplines.
- Assigning, starting, completing, freeing, taking back and deleting a match carry `affectedTypeIds`: the other disciplines whose open matches of the same players change `isPlayable`. The outbound scopes include them.
- admin-view has e2e tests for the reconnect resync and for `TABLE_LOCKED`/`TABLE_UNLOCKED`, `PLAYER_PAID`, `PLAYER_ACTIVE_CHANGED` and `DISCIPLINE_COLORS_CHANGED` (`e2e/live-updates.spec.ts`). Writing them found two backend bugs, both fixed: `/table/{nr}/lock` treated the table number as the id, and a hex text color did not fit the color table (now `mgmt_type_display`).
- The table manager retries a failed load twice and its error snackbar offers "Erneut laden".
- The table manager's table, table list and match item components use `OnPush`, compute the started match and the calls once per table change, and track tables and matches by id.
- The simple broker sends and expects STOMP heartbeats every 10 s (`WebSocketHeartbeatIT`).

## 9. After the Angular 22 update

Open:

- **OnPush everywhere.** The `ng update` migration added `ChangeDetectionStrategy.Eager` to every component without a strategy (40 in admin-view, 6 in tablemanager-view, 4 in result-view), and the lint rule `@angular-eslint/prefer-on-push-component-change-detection` is off in all three clients. Move them to OnPush, turn the rule back on, then consider dropping zone.js (zoneless is Angular's default since v21).
- **Sass `@import`.** tablemanager-view's `styles.scss` uses `@import`, which Dart Sass 3 removes; move to `@use`.
- **Console errors in admin-view, seen in the e2e run.** Neither fails a test and both predate the update. The result list's quick entry binds `[(ngModel)]="element.result"` to a frozen store object ("Cannot assign to read only property 'result'"). An `ngModel` inside a `<form>` without `name` or `standalone` throws NG01352 (`result-modal` or `select-match-modal`, seen in the assign tests).
- **Flaky reconnect e2e tests.** "resynchronizes after a reconnect" (admin-view `e2e/live-updates.spec.ts`) and "should resynchronize after the websocket connection was lost" (tablemanager-view `e2e/tablemanager.spec.ts`) fail now and then on `main` as well: the admin test failed 4 of 5 repeats there, the table manager test about every second full run. Both wait for the resync after a reconnect.

Resolved:

- **TypeScript strict mode.** All three clients compile with `strict: true` (TypeScript 6's default). The models say what the backend always sends (`Match.team1`/`team2`, `Match.id`, `TableDto.id`/`number` in admin-view, the players of a Match in the other two), and selections that can be missing say so.
