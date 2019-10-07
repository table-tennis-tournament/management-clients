import {Club} from './club.model';

export interface Player {
    id?: number;
    firstName?: string;
    lastName?: string;
    club?: Club;
}