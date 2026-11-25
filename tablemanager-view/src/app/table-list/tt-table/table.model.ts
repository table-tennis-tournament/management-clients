import { Match } from '../match/match.model';

export interface Table {
  table_id?: number;
  table_number?: number;
  table_manager_id?: number;
  matches: Match[];
}
