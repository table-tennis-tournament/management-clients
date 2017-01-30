import {Component, Input} from "@angular/core";
import {DisciplineStage} from "../data/discipline.stage"

@Component({
    selector: "ng-view",
    templateUrl : "assets/javascripts/views/stage.view.component.html"
})
export class StageViewComponent{

     _stage: DisciplineStage;
    get stage(): DisciplineStage {
        return this._stage;
    }

    @Input("stage")
    set stage(value: DisciplineStage){
        this._stage = value;
    } 
   
}