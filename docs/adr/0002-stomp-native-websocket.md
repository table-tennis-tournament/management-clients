# STOMP over native WebSocket with thin events

The clients' real-time updates moved from raw SockJS snapshot-push to STOMP over native WebSocket. The backend publishes *thin* domain-event messages (`{"type":"MATCH_COMPLETED","payload":{…}}`) on a single `/topic/updates` topic, and clients treat each message as a "something changed" notification: they re-fetch the affected state from the REST API instead of receiving full snapshots. SockJS and the legacy raw-SockJS shim (`/ttt-websocket-legacy`) are removed entirely.

## Considered Options

- **Snapshot-push over STOMP** (mirror the old `UpdateMatches`/`UpdateTable`/`UpdateMatchList`/`UpdateTableManager` payloads) — rejected: keeps the backend responsible for assembling full read models for every consumer, coupling it to each client's view.
- **Thin events + client re-fetch** — chosen: the backend only signals *what changed*; REST stays the single source of truth and clients fetch exactly the state they need.
- **SockJS fallback** — rejected: all clients are modern Angular apps on browsers with native WebSocket; the fallback transport adds a server dependency and a second client library without benefit.

## Consequences

- The backend STOMP endpoint `/ttt-websocket` is registered without `.withSockJS()`; clients connect with `@stomp/stompjs` using a native `brokerURL`.
- Client state is refreshed by mapping each event `type` to the existing `Load*`/`Reload*` actions; a match/table event triggers a re-fetch rather than a local state patch.
- Integration tests (`OutboundModuleIT`, `TournamentOutboundIT`, `MatchLifecycleOutboundIT`) connect a native `StandardWebSocketClient` and assert the event `type` and `payload` on `/topic/updates`.
