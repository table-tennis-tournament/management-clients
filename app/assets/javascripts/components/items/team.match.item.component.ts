import {Component, Input} from "@angular/core";
import {Player} from "../../data/player";
import {TypeColors} from "../../data/typeColors";

@Component({
    selector: "team-match-item",
    templateUrl : "assets/javascripts/views/items/team.match.item.component.html",
})
export class TeamMatchItemComponent{

    @Input() team:Player[];

    @Input() showDisciplines:boolean;

    @Input() showClubs: boolean = false;

    typeColors:string[];
    
    constructor(){
        this.typeColors = TypeColors.TYPE_COLORS;
    }
}