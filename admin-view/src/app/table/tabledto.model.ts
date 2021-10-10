import { Match } from '../shared/data/match.model';

export interface TableDto {
  id?: number;
  number?: number;
  isLocked?: boolean;
  matches: Match[];
}
