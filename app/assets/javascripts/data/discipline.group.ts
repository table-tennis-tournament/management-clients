import {MatchDto} from "./match.dto";
import {Player} from "./player";

export class DisciplineGroup{
    name: string;
    players: Player[] =[];
    matches: MatchDto[]= [];
    bgColor: string;
    textColor: string;
    tableNumbers: number[]=[];
    isPlayerActive:boolean = true;
    isMatchActive:boolean = false;
}