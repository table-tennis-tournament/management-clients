import {Component, Input} from "@angular/core"
import {Match} from "../data/Match"


@Component({
  templateUrl : "assets/javascripts/views/table.component.html"
})
export class MatchComponent{

    @Input() public match: Match;
}