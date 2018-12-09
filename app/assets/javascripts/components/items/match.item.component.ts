import {Component, Input} from "@angular/core";
import {TypeColors} from "../../data/typeColors";
import {Match} from '../../data/match';

@Component({
    selector: "match-item",
    templateUrl : "assets/javascripts/views/items/match.item.component.html",
})
export class MatchItemComponent{

    @Input() match:Match;

    typeColors:string[];

    constructor(){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
   
}