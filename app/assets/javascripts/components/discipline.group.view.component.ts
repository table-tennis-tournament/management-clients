import {Component, Input, EventEmitter, OnChanges, SimpleChanges} from "@angular/core";
import {DisciplineGroup} from "../data/discipline.group"
import {TypeColors} from "../data/typeColors"
import {MatchListService} from "../services/match.list.service"
import {MaterializeAction} from "angular2-materialize";
import { RandomMatchService } from "../services/random.match.service";

@Component({
    selector: "group-view",
    templateUrl : "assets/javascripts/views/discipline.group.view.component.html"
})
export class DisciplineGroupViewComponent implements OnChanges{
    typeColors: string[];
    currentTableInput:any;
    openMatches:number;
    allMatchCount:number;
    tableNumbers: any[];
    collapsibleActions:EventEmitter<string|MaterializeAction> = new EventEmitter<string|MaterializeAction>();
    
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

    onExpandMatches(){
        this._group.isMatchActive = true;
        this.collapsibleActions.emit({action:"collapsible",params:["open",1]});
    } 

    onExpandPlayers(){
        this._group.isPlayerActive = true;
        this.collapsibleActions.emit({action:"collapsible",params:["open",0]});
    } 

    ngOnChanges(changes: SimpleChanges): void {
        let log: string[] = [];
        for (let propName in changes) {
          let changedProp = changes[propName];
          let to = JSON.stringify(changedProp.currentValue);
          if (changedProp.isFirstChange()) {
            log.push(`Initial value of ${propName} set to ${to}`);
          } else {
            let from = JSON.stringify(changedProp.previousValue);
            log.push(`${propName} changed from ${from} to ${to}`);
          }
        }
    }

    calculateOpenMatches(){
        this.openMatches = 0;
        this._group.matches.forEach(element => {
            if(element.match.isPlayed !== true){
                this.openMatches++;
            }
        });
        this.allMatchCount = this._group.matches.length;
    }

    setTables(){
        var numberArray = [];
        this._group.tableNumbers.forEach(element =>{
            if(numberArray.indexOf(element) < 0){
                numberArray.push(element);
            }
        });
        this.tableNumbers = numberArray;
    }

    addTableClicked(){
        if(isNaN(this.currentTableInput)){
            alert("Eingabe muss Nummer sein.");
            return;
        }
        if(this.currentTableInput){
            this.matchListService.setGroupOnTable(this.group.matches[0].group.id, this.currentTableInput).subscribe(x=>alert("Erfolgreich eingetragen."), error=>console.log(error));
        }

    }
   
}