import {Component, Input} from "@angular/core";
import {DisciplineGroup} from "../data/discipline.group"
import {TypeColors} from "../data/typeColors"
import {MatchListService} from "../services/match.list.service"

@Component({
    selector: "group-view",
    templateUrl : "assets/javascripts/views/discipline.group.view.component.html"
})
export class DisciplineGroupViewComponent{

    typeColors: string[];
    currentTableInput:any;
    showInput:boolean = true;

    constructor(private matchListService: MatchListService){
        this.typeColors = TypeColors.TYPE_COLORS;
    }

     _group: DisciplineGroup;
    get group(): DisciplineGroup {
        return this._group;
    }

    @Input("group")
    set group(value: DisciplineGroup){
        this.showInput = true;
        if(value.tableNumbers){
            this.showInput = value.tableNumbers.length ===0;
        }
        this._group = value;
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