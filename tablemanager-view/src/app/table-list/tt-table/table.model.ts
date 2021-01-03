import {Match} from '../match/match.model';

export interface Table {
    table_id?: string;
    table_number?: string;
    table_manager_id?: number;
    matches: Match[];
}
