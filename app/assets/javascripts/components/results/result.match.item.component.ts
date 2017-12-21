import {Component, Input} from "@angular/core";
import {MatchDto} from "../../data/match.dto";
import {TypeColors} from "../../data/typeColors";

@Component({
    selector: "result-match-item",
    templateUrl : "assets/javascripts/views/results/result.match.item.component.html",
})
export class ResultMatchItemComponent{

    @Input() match:MatchDto;

    typeColors:string[];

    constructor(){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
   
}