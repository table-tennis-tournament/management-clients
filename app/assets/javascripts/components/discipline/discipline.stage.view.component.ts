import {Component, Input, EventEmitter, Output} from "@angular/core";
import {DisciplineStage} from "../../data/discipline.stage";


@Component({
    selector : "discipline-stage",
    templateUrl : "assets/javascripts/views/discipline/discipline.stage.view.component.html"
})
export class DisciplineStageComponent{

    lineStageClass:string[];

    @Output() onDeleteStage = new EventEmitter<DisciplineStage>();

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
}