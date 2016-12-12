import {Component, Input} from "@angular/core";
import {Player} from "../data/player";


@Component({
  templateUrl : "assets/javascripts/view/playerDetail.html"
})
export class PlayerDetailComponent{
  
  @Input() player:Player;
}