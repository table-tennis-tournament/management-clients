import {MatchDto} from "../data/match.dto"
import {IResultHandler} from "../handler/result.handler"

export class ResultEvent {
    handler: IResultHandler;
    match: MatchDto;
}