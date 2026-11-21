# Follow-ups found during the live-update analysis

These issues are not caused by the WebSocket (STOMP) migration. They were found while analysing why updates do not reach the clients. They influence what a client sees after a re-fetch, but they are tracked separately from the live-update work (ADR 0003) and must not be mixed into it.

## 1. Match state mismatch in admin-view

Resolved by architecture review candidate 3: the clients use the backend `MatchState` names plus `callNumber` through `shared/match-state`, and `TableController.legacyState` is gone. The admin result list lists *Finished* matches, which is how freed ("Frei") matches wait for their result; unplayed matches are *Walkover* and are not listed.

## 2. Tablemanager DTO mismatches

- `tablemanager-view/src/app/table-list/tt-table/table.model.ts` declares `table_id` and `table_number` as optional strings; the backend `TableManagerTableInfo` emits nullable `Long`.
- The backend returns `club = null` for every tablemanager player (`TableController.kt`), so the club is blank. (`call_count` is the player's own call count, so a Side's badge shows from its Second call on.)
- The player IDs selected in the tablemanager player dialog are dropped at the HTTP boundary (`match.service.ts`), and the backend endpoint only needs the `matchId`.
- The navigation menu lists table managers 1-4 while the routes support 1-5.

## 3. Standalone Dockerfiles and nginx configs

Resolved: the per-app `Dockerfile`s, their `my_server_block.conf` and `admin-view/docker-compose.yml` were unused and broken, and are deleted. All clients ship in the image built from `Dockerfile-clients` with the root `my_server_block.conf`.

## 4. result-view

Resolved: result-view follows the `matches` topic with its own copy of `src/app/shared/update-events/` and the config `src/app/updates/result-updates.ts`; it reloads the displayed discipline when one of its results changes. The selected discipline lives in the store (`selectedTypeId`), so reloads keep the tab, the hardcoded `loadMatches({typeId: 8})` is gone, and `team-item` shows the club the backend now sends. `e2e/live-updates.spec.ts` checks a result entered elsewhere appears without reloading. The result components use `OnPush` and track groups and matches, so a reload keeps the rendered cards.

## 5. PlantUML diagrams

Resolved: `container.puml` and `backend-components.puml` show the Kotlin/Spring Boot backend, its Spring Modulith modules, the domain events between them and the STOMP topics; arc42 chapters 1, 2, 5 and 7 no longer describe the Scala/Play backend.

## 6. Rename "stop" to "take back"

Resolved: the table manager's "Zurück" calls `POST /api/v2/match/takeBack/{id}`, which maps to `MatchService.takeBackRunningMatch`. `POST /api/v2/match/stop/{id}` stays as a deprecated alias for one release (`TournamentModuleIT` covers both); remove it with the next release.

## 7. Other open items

All resolved:

- Playwright 1.65.1 installs its browsers on Ubuntu 26.04 (the sandbox and GitHub's `ubuntu-latest`); the e2e suites of all three clients pass locally and run in CI.
- `MATCH_LIST_CHANGED` names the queued matches, those just added to or removed from the queue, and their disciplines.
- Assigning, starting, completing, freeing, taking back and deleting a match carry `affectedTypeIds`: the other disciplines whose open matches of the same players change `isPlayable`. The outbound scopes include them.
- admin-view has e2e tests for the reconnect resync and for `TABLE_LOCKED`/`TABLE_UNLOCKED`, `PLAYER_PAID`, `PLAYER_ACTIVE_CHANGED` and `DISCIPLINE_COLORS_CHANGED` (`e2e/live-updates.spec.ts`). Writing them found two backend bugs, both fixed: `/table/{nr}/lock` treated the table number as the id, and a hex text color did not fit `mgmt_typecolors` (V7).
- The table manager retries a failed load twice and its error snackbar offers "Erneut laden".
- The table manager's table, table list and match item components use `OnPush`, compute the started match and the calls once per table change, and track tables and matches by id.
- The simple broker sends and expects STOMP heartbeats every 10 s (`WebSocketHeartbeatIT`).
