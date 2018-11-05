import {MatchDto} from "./match.dto"

export class TableDto{
    id: number;
    number: number;
    isLocked: boolean;
    matches: MatchDto[];
}