import {Component, Input} from "@angular/core";
import {MatchListDto} from "../data/match.list.dto";
import {TypeColors} from "../data/typeColors";
import {MatchListService} from "../services/match.list.service";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html",
})
export class MatchListComponent{

    public matches: Array<any> = [];
    public colorArray: string[] = [];
    sourceList: Array<any> = [{name:"item1"},{name:"item2"}];

    constructor(private matchListService: MatchListService){
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
        console.log("error on get All matches for waitinglist");
        console.log(error);
    }

    transferDataSuccess($event) {
        if($event.dragData.team1){
            var matchListItem = new MatchListDto();
            matchListItem.matchinfo = $event.dragData;
            this.matches.push(matchListItem);
            this.matchListService.addMatchListItem(matchListItem.matchinfo.match.id, this.matches.length).subscribe(
                e => console.log(e),
                error =>console.log(error)
            )
        }
        if($event.dragData.matches){
            var matchListItem = new MatchListDto();
             this.matches.push($event.dragData);
            this.matchListService.addGroupListItem($event.dragData.matches[0].group.id, this.matches.length).subscribe(
                e => console.log(e),
                error =>console.log(error)
            );
        }
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