import {Player} from "./player";
import {Match} from './match';

export class DisciplineGroup{
    name: string;
    players: Player[] =[];
    matches: Match[]= [];
    bgColor: string;
    textColor: string;
    tableNumbers: number[]=[];
    isPlayerActive:boolean = true;
    isMatchActive:boolean = true;
    isComplete:boolean = false;
}