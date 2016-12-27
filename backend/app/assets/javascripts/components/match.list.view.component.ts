import {Component, Input} from "@angular/core";
import {MatchDto} from "../data/match.dto";
import {MatchService} from "../services/match.service";
import {RandomMatchService} from "../services/random.match.service";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html"
})
export class MatchListComponent{

    public matches: MatchDto[];

    constructor(private matchService: MatchService, private randomMatchService: RandomMatchService){
        // this.matches = this.randomMatchService.getRandomMatches(30);
       matchService.getAllMatches().subscribe(
           this.getAllMatchesSuccess.bind(this),
           this.getAllMatchesError
       )
    }

    private getAllMatchesSuccess(matches: MatchDto[]){
        console.log("On set matches");
        this.matches = matches;
        console.log("After set matches");
    }
    private getAllMatchesError(error){
        console.log("error on get All matches");
        console.log(error);
    }
}