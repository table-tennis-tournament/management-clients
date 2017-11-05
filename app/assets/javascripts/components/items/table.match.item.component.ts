import {Component, Input} from "@angular/core";
import {MatchDto} from "../../data/match.dto";
import {TypeColors} from "../../data/typeColors";
import {MatchToStringService} from "../../services/match.toString.service";

@Component({
    selector: "table-match-item",
    templateUrl : "assets/javascripts/views/items/table.match.item.component.html",
})
export class TableMatchItemComponent{

    @Input() matches:MatchDto[];

    typeColors:string[];

    constructor(public matchToStringService: MatchToStringService){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
   
}