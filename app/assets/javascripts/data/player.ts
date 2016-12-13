import {Club} from "./club"

export class Player {
	id: number;
	firstName: string;
	lastName: string;
	ttr: number;
	sex: string;
	club: Club;

	constructor(firstName: string, lastName:string, club: Club){
		this.firstName = firstName;
		this.lastName = lastName;
		this.club = club;
	}
}
