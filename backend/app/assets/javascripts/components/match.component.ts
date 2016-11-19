import {Component} from "@angular/core"
import {MatchService} from "../services/match.service"

import {Match} from "../data/Match"


@Component({
  templateUrl:"assets/javascripts/views/player.component.html"
})
export class PlayerComponent{

    public matches: Match[];
    public selectedMatch: Match;

    constructor(private matchService:MatchService) {
        this.matchService = matchService;
        this.matches = [];
        this.matchService.getAllMatches().subscribe(
                               matches => this.matches = matches, 
                                err => {
                                    console.log(err);
                                });
    }

   onSelect(match: Match) { this.selectedMatch = match; }
}