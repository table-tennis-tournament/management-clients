import {Player} from "./player"
import {Type} from "./type"
import {TableGroup} from "./TableGroup"

export class Match {
	id: number;
	team1: Player[];
	team2: Player[];
	type: Type;
	stage: string;
	groupName: string;
	startTime: Date;
	allowedTableGroups: TableGroup[];
	result: any;
}