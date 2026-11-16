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

`admin-view/my_server_block.conf` lacks `proxy_http_version 1.1` for `/ttt-websocket`. `tablemanager-view/my_server_block.conf` and `result-view/my_server_block.conf` have no `/api/v2` or `/ttt-websocket` proxy. `result-view/Dockerfile` uses `node:12.8` and `bitnami/nginx:1.16`. Only `Dockerfile-clients` with the root `my_server_block.conf` is correct. Fix or delete the standalone images.

## 4. result-view

result-view has no WebSocket code. Wiring it up is a separate piece of work: copy `src/app/shared/update-events/` from admin-view, declare an `UpdateClientConfig` for `matches` and `settings`, and add `@stomp/stompjs` and a `/ttt-websocket` entry in `backend/proxy.conf.json`. Prerequisites and known defects:

- `result.component.ts` selects `types[0]` on every `types` emission, so an event-driven reload would reset the selected tab. Keep `currentTabId` in the store.
- `result.component.ts` dispatches a hardcoded `loadMatches({typeId: 8})`.
- `team-item.component.html` reads `team[0].club.name`, but the backend `TournamentPlayer` has no `club`.
- No `trackBy` and no `OnPush`; every reload re-renders all group cards and the bracket.

## 5. PlantUML diagrams

The PlantUML diagrams (`docs/arc42/diagrams`, e.g. `backend-components.puml`, `container.puml`) still describe the legacy Scala/Play/Pekko/SockJS backend. The text in arc42 chapters 02, 04, 06 and 09 and `spec/06_live_updates.md` now describes STOMP and the five topics.

## 6. Rename "stop" to "take back"

The domain term is **Take back** (see `GLOSSARY.md`), but the table manager's "Zurück" still calls `POST /api/v2/match/stop/{id}`, which maps to `MatchService.stopMatch` and `TournamentMatchRepository.stopMatch`. Rename the endpoint (keeping the old path as an alias for a release) and the service method. The repository method no longer exists: `stopMatch` is now `TournamentMatch.takeBack()` plus `save`, guarded by the Match being in play. The update event is already `MATCH_TAKEN_BACK`.

## 7. Other open items

- Playwright browsers cannot be installed in the development sandbox (Ubuntu 26.04), so the new e2e tests (`tablemanager-view/e2e/tablemanager.spec.ts`: "Zurück", take back by another client, reconnect resync) and the admin-view Karma specs were only type-checked locally. Run them in CI.
- `MATCH_LIST_CHANGED` scope does not name the disciplines of the queued matches, so a future scope-filtering client would not know which discipline view to refresh.
- Completing, freeing or taking back a match changes `isPlayable` of other matches of the same players; a future scope-filtering client of other disciplines would miss that.
- admin-view has no e2e test for the reconnect resync or the new topics (`TABLE_LOCKED`, `PLAYER_PAID`, `PLAYER_ACTIVE_CHANGED`, `DISCIPLINE_COLORS_CHANGED`).

- Tablemanager `loadTablesError` only opens a snackbar; there is no retry.
- Components are not `OnPush` and templates call array-scanning methods; reloads replace every table object.
- No server heartbeats: `enableSimpleBroker` has no task scheduler (inference), so idle connections are detected only by the proxy.
