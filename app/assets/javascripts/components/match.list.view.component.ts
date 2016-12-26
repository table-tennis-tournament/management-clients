import {Component, Input} from "@angular/core";
import {Match} from "../data/match";
import {MatchService} from "../services/match.service";
import {RandomMatchService} from "../services/random.match.service";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html"
})
export class MatchListComponent{

    public matches: Match[];

    constructor(private matchService: MatchService, private randomMatchService: RandomMatchService){
        this.matches = this.randomMatchService.getRandomMatches(30);
    //    matchService.getAllMatches().subscribe(
    //        this.getAllMatchesSuccess,
    //        this.getAllMatchesError
    //    )
    }

    private getAllMatchesSuccess(matches){
        this.matches = matches;
    }
    private getAllMatchesError(error){
        console.log("error on get All matches");
        console.log(error);
    }
}