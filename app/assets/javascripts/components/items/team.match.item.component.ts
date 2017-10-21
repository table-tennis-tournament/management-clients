import {Component, Input} from "@angular/core";
import {Player} from "../../data/player";

@Component({
    selector: "team-match-item",
    templateUrl : "assets/javascripts/views/items/team.match.item.component.html",
})
export class TeamMatchItemComponent{

    @Input() team:Player[];


    constructor(){
        console.log("on out");
    }

   
}