import {Component, ViewContainerRef, ViewEncapsulation, ViewChild} from "@angular/core"
import {MatchListService} from "../services/match.list.service"
import {DisciplineMatchListComponent} from "./discipline.match.list.view.component"
import { ResultEvent } from "app/assets/javascripts/handler/result.event";

@Component({
  templateUrl:"assets/javascripts/views/table.assign.view.component.html"
})
export class TableAssignViewComponent{

    public selectedOption:string;
    public isWaitingListActive: boolean;

    @ViewChild(DisciplineMatchListComponent) matchListComponent: DisciplineMatchListComponent;


    constructor(private matchListService:MatchListService) {
        this.selectedOption = "2";
    }

    onTableAssigned($event:ResultEvent){
        this.matchListComponent.onTableAssigned($event);
    }

    onSetWaitingListActiveSuccess(){
        console.log("waiting list changed success");
    }

    onError(error){
        console.log("Get all Tables failed following problems:");
        console.log(error);
        this.isWaitingListActive = !this.isWaitingListActive;
    }
  
}