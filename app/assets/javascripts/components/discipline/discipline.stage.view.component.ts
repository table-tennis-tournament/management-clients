import {Component, Input} from "@angular/core";
import {DisciplineStage} from "../../data/discipline.stage";


@Component({
    selector : "discipline-stage",
    templateUrl : "assets/javascripts/views/discipline/discipline.stage.view.component.html"
})
export class DisciplineStageComponent{

    isOpen:boolean = false;
  
    @Input() stage:DisciplineStage;
}