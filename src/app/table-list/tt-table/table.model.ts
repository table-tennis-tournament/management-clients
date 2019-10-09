import {Match} from '../match/match.model';

export interface Table {
    table_id?: string;
    table_manager_id?: number;
    current_match: Match;
}
