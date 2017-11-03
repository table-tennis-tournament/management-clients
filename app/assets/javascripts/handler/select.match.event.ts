import {MatchDto} from "../data/match.dto"
import {ISelectMatchHandler} from "../handler/select.match.handler"

export class SelectMatchEvent {
    handler: ISelectMatchHandler;
    matches: MatchDto[];
}