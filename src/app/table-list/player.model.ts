import {Club} from './club.model';

export interface Player {
    player_id?: number;
    first_name?: string;
    last_ame?: string;
    club?: Club;
}