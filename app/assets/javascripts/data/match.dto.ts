import {Player} from "./player"
import {Type} from "./type"
import {Group} from "./group"
import {MatchType} from "./matchType"
import {TableGroup} from "./tableGroup"
import {MatchLight} from "./match.light"
import {TableLight} from "./table.light"

export class MatchDto {
    match: MatchLight;
	team1: Player[];
	team2: Player[];
	type: Type;
	matchType: MatchType;
	group: Group;
	table: TableLight;
}