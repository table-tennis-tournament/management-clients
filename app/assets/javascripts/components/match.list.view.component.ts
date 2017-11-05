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
            this.matchListService.addMatchListItem(matchListItem.matchinfo.match.id, this.matches.length).subscribe(
                this.onMatchlistItemAdded.bind(this, matchListItem),
                error =>console.log(error)
            );
            return;
        }
        if($event.dragData.matches){
            var matchListItem = new MatchListDto();
            this.matchListService.addGroupListItem($event.dragData.matches[0].group.id, this.matches.length).subscribe(
                this.onMatchlistItemAdded.bind(this, $event.dragData),
                error =>console.log(error)
            );
        }
    }

    onMatchlistItemAdded(matchListItem: MatchListDto){
        this.matches.push(matchListItem);
    }

    onDragStart($event){
        console.log("start deleting match item");
        this.matchListService.deleteMatchListItem($event.match.matchinfo.match.id);
    }

    onDropSuccess($event){
        
        console.log("drop success");
        console.log($event);
    }

    onDelete(index){
        // var newIndex = this.matches.indexOf(index, 0);
        if (index > -1 && this.matches) {
            var itemToDelete = this.matches[index];
            this.matchListService.deleteMatchListItem(itemToDelete.matchinfo.match.id).subscribe(this.onMatchlistItemDeleted.bind(this, index));
        }
    }

    onMatchlistItemDeleted(index){
        this.matches.splice(index, 1);
    }
}