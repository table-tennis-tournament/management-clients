import {Club} from '../shared/data/club.model';

export interface Player {
    id?: number;
    firstName?: string;
    lastName?: string;
    ttr?: number;
    sex?: string;
    club?: Club;
    hasMatches?: boolean;
    types?: number[];
    isActive: boolean;
}