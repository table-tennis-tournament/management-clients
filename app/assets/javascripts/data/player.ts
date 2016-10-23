import {Club} from './club';

export interface Player {
	id: number;
	firstName: string;
	lastName: string;
	ttr: number;
	sex: string;
	club: Club;
}
