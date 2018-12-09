import {ISelectMatchHandler} from "../handler/select.match.handler"
import {Match} from '../data/match';

export class SelectMatchEvent {
    handler: ISelectMatchHandler;
    matches: Match[];
}