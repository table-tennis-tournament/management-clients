import {IResultHandler} from "../handler/result.handler"
import {Match} from '../data/match';

export interface ResultEvent {
    handler?: IResultHandler;
    match?: Match;
}