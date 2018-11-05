import {Component, EventEmitter, Input, Output} from "@angular/core";
import {MaterializeAction} from "angular2-materialize";
import {DisciplineGroup} from "../../data/discipline.group"
import {TypeColors} from "../../data/typeColors"
import {MatchListService} from "../../services/match.list.service"
import {RandomMatchService} from "../../services/random.match.service";
import {ResultEvent} from "../../handler/result.event";

@Component({
    selector: "group-view",
    templateUrl : "assets/javascripts/views/discipline/discipline.group.view.component.html"
})
export class DisciplineGroupViewComponent{
    typeColors: string[];
    currentTableInput:any;
    openMatches:number;
    isComplete:boolean;
    allMatchCount:number;
    tableNumbers: any[];
    collapsibleActions:EventEmitter<string|MaterializeAction> = new EventEmitter<string|MaterializeAction>();

    @Output() onResultForMatch = new EventEmitter<ResultEvent>();
    
    constructor(private matchListService: MatchListService, private randomMatchService: RandomMatchService){
        this.typeColors = TypeColors.TYPE_COLORS;
        this.randomMatchService.expandMatches$.subscribe(this.onExpandMatches.bind(this));
        this.randomMatchService.expandPlayers$.subscribe(this.onExpandPlayers.bind(this));
    }

     _group: DisciplineGroup;
    get group(): DisciplineGroup {
        return this._group;
    }

    @Input("group")
    set group(value: DisciplineGroup){
        this._group = value;
        this.calculateOpenMatches();
        this.setTables();
    } 

    isGroupPlayable(){
        var isPlayable = true;
        this._group.matches.forEach(element => {
            if(element.isPlayable === false){
                isPlayable = false;
            }
        })
        return isPlayable;
    }

    onExpandMatches(){
        this._group.isMatchActive = true;
        this.collapsibleActions.emit({action:"collapsible",params:["open",1]});
    } 

    onExpandPlayers(){
        this._group.isPlayerActive = true;
        this.collapsibleActions.emit({action:"collapsible",params:["open",0]});
    } 

    calculateOpenMatches(){
        this.openMatches = 0;
        this.isComplete = true;
        this._group.matches.forEach(element => {
            if(element.match.isPlayed !== true){
                this.openMatches++;
            }
        });
        this.allMatchCount = this._group.matches.length;
    }

    onResultClicked(currentMatch){
        var resultEvent = new ResultEvent();
        resultEvent.match = currentMatch;
        this.onResultForMatch.emit(resultEvent);
    }

    setTables(){
        var numberArray = [];
        this._group.matches.forEach(element =>{
            element.table.forEach(tableNumber => {
                if(numberArray.indexOf(tableNumber) < 0){
                    numberArray.push(tableNumber);
                }
            })
           
        });
        this.tableNumbers = numberArray;
    }
   
}