import {Component, Input} from "@angular/core";
import {MatchListDto} from "../data/match.list.dto";
import {TypeColors} from "../data/typeColors";
import {MatchListService} from "../services/match.list.service";
import {RandomMatchService} from "../services/random.match.service";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html",
})
export class MatchListComponent{

    public matches: Array<MatchListDto>;
    public colorArray: string[];

    constructor(private matchListService: MatchListService, private randomMatchService: RandomMatchService){
       matchListService.getCompleteMatchlist().subscribe(
           this.getAllMatchesSuccess.bind(this),
           this.getAllMatchesError
       )
       this.colorArray = TypeColors.TYPE_COLORS;
    }

    private getAllMatchesSuccess(matches: MatchListDto[]){
        this.matches = matches;
    }
    private getAllMatchesError(error){
        console.log("error on get All matches");
        console.log(error);
    }

    transferDataSuccess($event) {
        console.log($event.dragData);
        if($event.dragData.team1){
            var matchListItem = new MatchListDto();
            matchListItem.matchinfo = $event.dragData;
            this.matches.push(matchListItem);
            this.matchListService.addMatchListItem(matchListItem.matchinfo.match.id, this.matches.length).subscribe(
                e => console.log(e),
                error =>console.log(error)
            )
        }
    }

    onUp(){
        console.log("on up clicked");
    }
    onDown(){
        console.log("on down clicked");
    }

    onDelete(index){
        console.log("on delete"+ index);
        var newIndex = this.matches.indexOf(index, 0);
        if (index > -1) {
            var itemToDelete = this.matches[index];
            this.matches.splice(newIndex, 1);
            this.matchListService.deleteMatchListItem(itemToDelete).subscribe(x=>console.log(x));
        }
        
    }
}