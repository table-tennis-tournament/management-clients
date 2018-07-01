import {Club} from '../clubview/club.model';

export interface Player {
    id?: number;
    firstName?: string;
    lastName?: string;
    ttr?: number;
    sex?: string;
    club?: Club;
}
