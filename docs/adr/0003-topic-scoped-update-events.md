# Topic-scoped thin update events with post-commit publication

ADR 0002 put every update event on one `/topic/updates` topic, so every client receives and reacts to every event. We split it into five topics along the module and use-case boundaries (`/topic/matches`, `/topic/tables`, `/topic/queue`, `/topic/players`, `/topic/settings`), and each client subscribes only to the topics its views render. Each event carries a *scope* in the message body so clients can ignore events that do not concern their current view. Events are published only after the originating transaction has committed, so a client that re-fetches on an event always reads the committed state.

## Considered Options

- **Single `/topic/updates` topic (status quo)** — rejected: every client reloads on events it does not care about, and a bulk operation multiplies that load.
- **Per-scope topics** (for example `/topic/matches/type/8`) — rejected: the in-memory simple broker would need a destination per discipline and table, and clients would constantly resubscribe as the user navigates. One tournament and a few dozen clients do not justify this; clients filter by scope instead.
- **Event replay buffer** with `Last-Event-ID` style catch-up — rejected: REST is the source of truth, so a client that may have missed events simply reloads its own state (*resynchronization*).

## Consequences

- Topic ownership: `matches` for the match lifecycle and results, `tables` for assignment, locking and the table manager view, `queue` for the match list, `players` for registration and payment, `settings` for discipline colors.
- Subscriptions: admin-view listens to all five topics, tablemanager-view to `tables` and `matches`. result-view is not wired yet; it will need `matches` and `settings`.
- The envelope is `{"type": ..., "scope": {"matchIds": [], "typeIds": [], "tableIds": []}, "payload": ...}`. An empty list means the event does not touch that dimension; a client that finds no `scope` at all reloads to be safe.
- A bulk operation (free, take back, call, remove from table) publishes one event with all `matchIds`, not one event per match. Clients additionally coalesce bursts with RxJS `auditTime(200)`, applied per reload target so that events of different kinds inside one window are not lost.
- Taking a match back from its table publishes `MATCH_TAKEN_BACK`, whether the administrator or the table manager does it (also "remove matches from table"). Its scope carries the table the match was on before. `MATCH_ASSIGNED` and `MATCH_STARTED` name both the new and the previous table, so the manager of the table a match was moved away from also refreshes.
- The scope fields live in the STOMP message body next to `type`, not in STOMP headers: the simple broker cannot filter by header, and the body is already parsed by the clients.
- Because there is no replay, every client resynchronizes its state after every reconnect (the initial load covers the first connect). Events lost while disconnected are never delivered.
- Mutations that currently publish no event (taking a match back from the table in the tablemanager, remove matches from table, table lock/unlock, delete match, delete discipline, player paid, discipline colors) must publish one on the matching topic, otherwise other clients stay stale. The automation switches (auto-assign, auto-start) publish no event.
- Outbound listeners use `@TransactionalEventListener(phase = AFTER_COMMIT)` instead of `@EventListener`.
