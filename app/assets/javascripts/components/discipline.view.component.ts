import {Component, Input} from "@angular/core";
import {DisciplineTab} from "../data/discipline.tab"

@Component({
    selector: "discipline-view",
    templateUrl : "assets/javascripts/views/discipline.view.component.html"
})
export class DisciplineViewComponent{
    public tabs: DisciplineTab[];
    
    constructor(){
        this.tabs = [];
        this.tabs[0] = new DisciplineTab(1, "Herren B");
        this.tabs[1] = new DisciplineTab(1, "Herren C");
        this.tabs[2] = new DisciplineTab(1, "Herren D");
        this.tabs[3] = new DisciplineTab(1, "Herren E");
    }
   
}