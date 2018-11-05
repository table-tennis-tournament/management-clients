import {Player} from "./player"
import {Type} from "./type"
import {Group} from "./group"
import {MatchType} from "./matchType"
import {MatchLight} from "./match.light"

export class MatchDto {
    match: MatchLight;
	team1: Player[];
	team2: Player[];
	type: Type;
	matchType: MatchType;
	group: Group;
	table:  number[];
	isPlayable: boolean;
	isInWaitingList: boolean;
}