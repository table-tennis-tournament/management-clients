import {Component, Input} from "@angular/core";
import {DisciplineTab} from "../data/discipline.tab"
import {DisciplineGroup} from "../data/discipline.group"

@Component({
    selector: "discipline-view",
    templateUrl : "assets/javascripts/views/discipline.view.component.html"
})
export class DisciplineViewComponent{
    public tabs: DisciplineTab[];

    public rowCount: number
    
    constructor(){
        this.tabs = [];
        this.tabs[0] = new DisciplineTab(1, "Herren B");
        this.tabs[0].groups = this.getDisciplineGroups(27);
        this.tabs[1] = new DisciplineTab(2, "Herren C");
         this.tabs[1].groups = this.getDisciplineGroups(5);
        this.tabs[2] = new DisciplineTab(3, "Herren D");
         this.tabs[2].groups = this.getDisciplineGroups(2);
        this.tabs[3] = new DisciplineTab(4, "Herren E");
         this.tabs[3].groups = this.getDisciplineGroups(22);
    }

    getDisciplineGroups(count: number): DisciplineGroup[]{
        var result: DisciplineGroup[] = [];
        for(var i=0; i< count; i++){
            result[i] = new DisciplineGroup();
        }
        return result;
    }
   
}