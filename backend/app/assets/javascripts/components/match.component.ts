import {Component} from "@angular/core"
import {MatchService} from "../services/match.service"

import {Match} from "../data/Match"


@Component({
  templateUrl:"assets/javascripts/views/match.component.html"
})
export class MatchComponent{

    public matches: Match[];
    public selectedMatch: Match;
    public rowCount: number[];

    constructor(private matchService:MatchService) {
        this.matchService = matchService;
        this.matches = [];
        this.matchService.getAllMatches().subscribe( matches =>{
                    this.matches = matches;
                    this.rowCount = Array.from(Array(Math.ceil(this.matches.length / 5)).keys());
                }, 
                err => {
                    console.log(err);
                });
    }

   onSelect(match: Match) { this.selectedMatch = match; }
}