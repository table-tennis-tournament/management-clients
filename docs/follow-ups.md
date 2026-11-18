# Follow-ups found during the live-update analysis

These issues are not caused by the WebSocket (STOMP) migration. They were found while analysing why updates do not reach the clients. They influence what a client sees after a re-fetch, but they are tracked separately from the live-update work (ADR 0003) and must not be mixed into it.

## 1. Match state mismatch in admin-view

Resolved by architecture review candidate 3: the clients use the backend `MatchState` names plus `callNumber` through `shared/match-state`, and `TableController.legacyState` is gone. The admin result list still lists *Finished* matches, which is how freed ("freigeben") matches wait for their result.

## 2. Tablemanager DTO mismatches

- `tablemanager-view/src/app/table-list/tt-table/table.model.ts` declares `table_id` and `table_number` as optional strings; the backend `TableManagerTableInfo` emits nullable `Long`.
- The backend returns `club = null` for every tablemanager player (`TableController.kt`), so the club is blank. (`call_count` now carries the match's `callNumber`, so the badge shows from the Second call on.)
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

- Playwright before 1.62 cannot install browsers on Ubuntu 26.04 (the sandbox, and now GitHub's `ubuntu-latest`); the clients use 1.65.1. Until then the new e2e tests (`tablemanager-view/e2e/tablemanager.spec.ts`: "Zurück", take back by another client, reconnect resync) were only type-checked locally. Run them in CI.
- `MATCH_LIST_CHANGED` scope does not name the disciplines of the queued matches, so a future scope-filtering client would not know which discipline view to refresh.
- Completing, freeing or taking back a match changes `isPlayable` of other matches of the same players; a future scope-filtering client of other disciplines would miss that.
- admin-view has no e2e test for the reconnect resync or the new topics (`TABLE_LOCKED`, `PLAYER_PAID`, `PLAYER_ACTIVE_CHANGED`, `DISCIPLINE_COLORS_CHANGED`).

- Tablemanager `loadTablesError` only opens a snackbar; there is no retry.
- Components are not `OnPush` and templates call array-scanning methods; reloads replace every table object.
- No server heartbeats: `enableSimpleBroker` has no task scheduler (inference), so idle connections are detected only by the proxy.
