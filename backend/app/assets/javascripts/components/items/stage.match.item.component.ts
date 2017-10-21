import {Component, Input} from "@angular/core";
import {MatchType} from "../../data/matchType";
import {Group} from "../../data/group";

@Component({
    selector: "stage-match-item",
    templateUrl : "assets/javascripts/views/items/stage.match.item.component.html",
})
export class StageMatchItemComponent{

    @Input() stage:MatchType;

    @Input() group:Group;

}