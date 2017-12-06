import {IResult} from "../data/result"
import { MatchDto } from "../data/match.dto";

export interface IResultHandler {
    handleResult(resultToHandle: IResult[], match: MatchDto)
}