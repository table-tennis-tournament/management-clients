import {Player} from "./player"
import {Type} from "./type"
import {TableGroup} from "./TableGroup"

export interface Match {
	id: number;
	team1: Player[],
	team2: Player[],
	type: Type,
	stage: string,
	currentMatchTime: Date,
	allowedTableGroups: TableGroup[],
	result: any,
	colorId: number
}