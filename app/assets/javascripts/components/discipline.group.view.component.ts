import {Component, Input} from "@angular/core";
import {DisciplineGroup} from "../data/discipline.group"

@Component({
    selector: "group-view",
    templateUrl : "assets/javascripts/views/discipline.group.view.component.html"
})
export class DisciplineGroupViewComponent{
     _group: DisciplineGroup;
    get group(): DisciplineGroup {
        return this._group;
    }

    @Input("group")
    set group(value: DisciplineGroup){
        this._group = value;
    } 
   
}