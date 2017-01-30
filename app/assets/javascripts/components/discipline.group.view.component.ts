import {Component, Input} from "@angular/core";
import {DisciplineGroup} from "../data/discipline.group"
import {TypeColors} from "../data/typeColors"


@Component({
    selector: "group-view",
    templateUrl : "assets/javascripts/views/discipline.group.view.component.html"
})
export class DisciplineGroupViewComponent{

    typeColors: string[];

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
    } 
   
}