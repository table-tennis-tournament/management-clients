import {Component, Input, EventEmitter, Output} from "@angular/core";
import {DisciplineGroup} from "../../data/discipline.group"
import {TypeColors} from "../../data/typeColors"

@Component({
    selector: "result-group-view",
    templateUrl : "assets/javascripts/views/results/result.group.view.component.html"
})
export class ResultGroupViewComponent{
    typeColors: string[];
    currentTableInput:any;
    openMatches:number;
    isComplete:boolean;
    allMatchCount:number;
    tableNumbers: any[];
    
   
    constructor(){
        this.typeColors = TypeColors.TYPE_COLORS;
    }

     _group: DisciplineGroup;
    get group(): DisciplineGroup {
        return this._group;
    }

    @Input("group")
    set group(value: DisciplineGroup){
        this._group = value;
        this.calculateOpenMatches();
    } 


    calculateOpenMatches(){
        this.openMatches = 0;
        this.isComplete = true;
        this._group.matches.forEach(element => {
            if(element.match.isPlayed !== true){
                this.openMatches++;
            }
            if(element.match.result == null){
                this.isComplete = false;
            }
        });
        this.allMatchCount = this._group.matches.length;
    }
   
}