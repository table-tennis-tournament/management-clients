import { Match } from './match';
import { Player } from './player';
import { StandingLine } from './standing';

export class DisciplineGroup {
  id?: number;
  name = '';
  players: Player[] = [];
  matches: Match[] = [];
  isPlayerActive = true;
  isMatchActive = true;
  isComplete = false;
  /** The standings by place; empty while none are loaded. */
  standings?: StandingLine[];
}
