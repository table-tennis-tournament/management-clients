import {MatchDto} from "./match.dto";
import {Player} from "./player";

export class DisciplineStage{
    name: string;
    matches: MatchDto[]= [];
    bgColor: string;
    textColor: string;
    isComplete:boolean;
}