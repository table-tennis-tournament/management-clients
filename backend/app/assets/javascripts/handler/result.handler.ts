import {IResult} from "../data/result"
import {Match} from '../data/match';

export interface IResultHandler {
    handleResult(resultToHandle: IResult[], match: Match)
}