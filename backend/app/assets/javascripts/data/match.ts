import {Player} from "./player"
import {Type} from "./type"
import {Group} from "./group"
import {MatchType} from "./matchType"
import {TableGroup} from "./tableGroup"

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
	matchType: MatchType;
	group: Group;
	tableNumber: number;
}