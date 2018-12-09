import {Component, Input} from "@angular/core";
import {TypeColors} from "../../data/typeColors";
import {MatchToStringService} from "../../services/match.toString.service";
import {Match} from '../../data/match';

@Component({
    selector: "table-match-item",
    templateUrl : "assets/javascripts/views/items/table.match.item.component.html",
})
export class TableMatchItemComponent{

    @Input() matches:Match[];

    typeColors:string[];

    constructor(public matchToStringService: MatchToStringService){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
   
}