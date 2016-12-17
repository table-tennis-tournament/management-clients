import {IResult} from "../data/result"

export interface IResultHandler {
    handleResult(resultToHandle: IResult[])
}