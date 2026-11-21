import { Discipline } from '../../discipline/discipline.model';
import { Match } from './match.model';
import { Player } from './player.model';

/** The matches at one table the caller announces a Call for. */
export interface MatchAggregate {
  name?: string;
  startTime?: string;
  /** The Call to announce: 1 for the first Call, 2 or 3 for a requested Second or Third call. */
  callNumber?: number;
  /** When the first Call was announced; absent before it. */
  firstCallTime?: string | null;
  discipline?: Discipline;
  /** The players the Call names: all for the first Call, only the missing ones for a Second or Third call. */
  players?: Player[];
  matches?: Match[];
  tableNumbers?: number[];
}
