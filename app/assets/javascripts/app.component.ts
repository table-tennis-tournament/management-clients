import {Component} from "@angular/core"
import {PlayerService} from "./services/player.service"

import {Player} from "./data/Player"


@Component({
  selector: "tt-app",
  templateUrl:"assets/javascripts/views/main.component.html"
})
export class AppComponent{
  public title = "TurnierManager";

  public players: Player[];
  public selectedPlayer: Player;

  constructor(private playerService:PlayerService) {
        this.playerService = playerService;
        this.players = [];
        playerService.getAllPlayers().subscribe(
                               players => this.players = players, 
                                err => {
                                    console.log(err);
                                });
    }

   onSelect(player: Player) { this.selectedPlayer = player; }
}
