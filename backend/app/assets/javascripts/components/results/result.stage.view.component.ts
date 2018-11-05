import {Component, Input} from "@angular/core";
import {DisciplineStage} from "../../data/discipline.stage";


@Component({
    selector : "result-stage-view",
    templateUrl : "assets/javascripts/views/results/result.stage.view.component.html"
})
export class ResultStageViewComponent{

    lineStageClass:string[];
    private _stage: DisciplineStage;
   
    constructor(){
        
    }

    @Input("stage")
    set stage(stage:DisciplineStage){
        this._stage = stage;
    }

    get stage(): DisciplineStage {
        return this._stage;
    }
   

}