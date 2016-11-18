import {Component, Input} from "@angular/core";
import {Player} from "./data/player";

@Component({
  selector: "my-player-detail",
  templateUrl : "assets/javascripts/view/playerDetail.html"
})
export class PlayerDetailComponent{
  @Input() player:Player;

}