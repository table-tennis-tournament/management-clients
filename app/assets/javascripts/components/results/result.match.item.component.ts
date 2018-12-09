import {Component, Input} from "@angular/core";
import {TypeColors} from "../../data/typeColors";
import {Match} from '../../data/match';

@Component({
    selector: "result-match-item",
    templateUrl : "assets/javascripts/views/results/result.match.item.component.html",
})
export class ResultMatchItemComponent{

    @Input() match:Match;

    typeColors:string[];

    constructor(){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
   
}