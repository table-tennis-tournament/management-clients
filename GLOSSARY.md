This glossary defines the canonical domain language of the Table Tennis Tournament Management System. It is the single source of truth for terminology used across the architecture documentation, the user interfaces and the codebase. Terms marked *deprecated* remain in the code but must not be used in new documentation or communication.

**Core concepts**

**Tournament** — a single table tennis event. One running backend instance manages exactly one tournament.

**Player** — a person registered for a tournament. A player has a TTR rating, belongs to a Club and is registered for one or more disciplines. A player is also the person who reads live results in the Result View.

**Club** — the organization a player belongs to.

**TTR** — the official table tennis ranking used for players in Germany.

**Discipline** — a competition category within the tournament, for example "Herren A" or "Damen D 0-1500". Each discipline has a *kind* (Singles or Doubles) plus attributes such as a TTR range, an age range, a playing system and a knockout size. A discipline is stored in the `type` table.

**Singles** — a playing format in which a Side consists of one Player.

**Doubles** — a playing format in which a Side consists of two Players (a Double).

**Double** — a specific pairing of two Players that forms one Side in a doubles match. Stored in the `doubles` table.

**Side** — one of the two competitors in a match. A Side is one Player (Singles) or one Double (Doubles). *Deprecated: "team".*

**Match structure**

**Match** — an encounter between two Sides. A match is won by the first Side to win three Sets (best of five).

**Set** — a subunit of a match. A set is won by the first Side to reach eleven Points; from 10:10 a lead of two points is required. *Deprecated: "game".*

**Point** — the atomic scoring unit within a set. *Deprecated: "ball".*

**Result** — the recorded outcome of a match: the set scores and the winning Side.

**Tournament flow**

**Group** — a round-robin group of players within a discipline. A group stage is played first; its results determine the knockout placement.

**Knockout stage** — the elimination bracket of a discipline, played after the group stage. Represented in the data by the reserved group identifier `999`.

**Stage** — where a match sits within its discipline: either the Group stage (Gruppenspiel) or a specific Knockout stage (Final, Semi-final, Quarter-final, Round of 16, Rounds 0–3, Third-place match, Placement matches, Top48/ER rounds). Stored in the `matchtype` table. In the knockout stage, the round number identifies the round within the bracket.

**Queue** — the ordered waiting list of matches used to let the tournament run without manual interaction. Matches in the queue are started automatically as tables become free. *Deprecated code name: "MatchList".*

**Call** — the announcement of a match and its players. **Second call** and **Third call** are repeat announcements issued when a player has not appeared.

**Infrastructure**

**Table** — a physical table tennis table on which matches are played.

**Locked table** — a table that is blocked from any match assignment, neither automatic nor manual.

**Table group** — a named set of tables.

**Match state lifecycle**

The lifecycle of a Match is expressed through its state:

**Open** — the match has been created but is neither in the queue nor played.

**In Queue** — the match has been placed in the Queue.

**At Table** — the match is assigned to a table but has not started.

**Called** — the first call for the match has been announced.

**Second call** / **Third call** — a repeat call has been announced because a player has not appeared.

**Started** — the match is being played.

**Completed** — the result has been entered and the match is finished.

**Finished** — the match has ended without a played result, for example a bye or a walkover ("free match"). Like Completed, it is a terminal state.

The lifecycle state is represented in code by `MatchState`, whose values are `Open`, `InWaitingList`, `Callable`, `OnTable`, `SecondCall`, `ThirdCall`, `Started`, `Finished` and `Completed`. Two code names are counter-intuitive: assigning a match to a table sets the state `Callable`, while announcing the call sets the state `OnTable`.

**External systems**

**click-TT** — the external registration and ranking platform that provides player and discipline data. Data is imported offline; there is no runtime integration.

**mktt** — the legacy tool that imports data from click-TT, creates the tournament database and sets up the groups and the knockout system. It runs offline before the tournament manager is used.
