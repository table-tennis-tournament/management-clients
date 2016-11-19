import {Component} from "@angular/core"
import {PlayerService} from "./services/player.service"

import {Player} from "./data/Player"


@Component({
  selector: "tt-app",
  templateUrl:"assets/javascripts/views/main.component.html"
})
export class AppComponent{
  title:string = "Turniermanager";
}
