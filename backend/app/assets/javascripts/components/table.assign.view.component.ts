import {Component, ViewChild} from "@angular/core"
import {MatchListService} from "../services/match.list.service"
import {DisciplineMatchListComponent} from "./discipline/discipline.match.list.view.component"
import {ResultEvent} from "app/assets/javascripts/handler/result.event";

@Component({
  templateUrl:"assets/javascripts/views/table.assign.view.component.html"
})
export class TableAssignViewComponent{

    public selectedOption:string;

    @ViewChild(DisciplineMatchListComponent) matchListComponent: DisciplineMatchListComponent;


    constructor(private matchListService:MatchListService) {
        this.selectedOption = "2";
    }

    onTableAssigned($event:ResultEvent){
        this.matchListComponent.onTableAssigned($event);
    }

  
}