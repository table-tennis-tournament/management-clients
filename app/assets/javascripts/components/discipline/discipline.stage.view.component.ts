import {Component, EventEmitter, Input, Output} from "@angular/core";
import {DisciplineStage} from "../../data/discipline.stage";
import {ResultEvent} from "../../handler/result.event";


@Component({
    selector : "discipline-stage",
    templateUrl : "assets/javascripts/views/discipline/discipline.stage.view.component.html"
})
export class DisciplineStageComponent{

    lineStageClass:string[];

    @Output() onDeleteStage = new EventEmitter<DisciplineStage>();

    @Output() onResultForMatch = new EventEmitter<ResultEvent>();

    constructor(){
        this.lineStageClass = [];
        this.lineStageClass.push("first-stage");
        this.lineStageClass.push("second-stage");
        this.lineStageClass.push("third-stage");
        this.lineStageClass.push("fourth-stage");
    }

    isOpen:boolean = true;

    onDelete(){
        this.onDeleteStage.emit(this.stage);
    }

    @Input() stage:DisciplineStage;

    @Input() index:number;

    onResultClicked(currentMatch){
        const resultEvent = new ResultEvent();
        resultEvent.match = currentMatch;
        this.onResultForMatch.emit(resultEvent);
    }
}