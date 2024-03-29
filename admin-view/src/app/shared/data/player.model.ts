import { Club } from './club.model';

export interface Player {
  id?: number;
  firstName?: string;
  lastName?: string;
  ttr?: number;
  sex?: string;
  club?: Club;
  hasMatches?: boolean;
  types?: number[];
}
