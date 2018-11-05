import {MatchDto} from "./match.dto";

export class DisciplineStage{
    name: string;
    matches: MatchDto[]= [];
    bgColor: string;
    textColor: string;
    isComplete:boolean;
}