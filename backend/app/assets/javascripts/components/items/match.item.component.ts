import {Component, Input} from "@angular/core";
import {MatchDto} from "../../data/match.dto";
import {TypeColors} from "../../data/typeColors";

@Component({
    selector: "match-item",
    templateUrl : "assets/javascripts/views/items/match.item.component.html",
})
export class MatchItemComponent{

    @Input() match:MatchDto;

    typeColors:string[];

    constructor(){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
   
}