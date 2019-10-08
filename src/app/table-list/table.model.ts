import {Match} from './match.model';

export interface Table {
    table_id?: number;
    table_manager_id?: number;
    current_match: Match;
}
