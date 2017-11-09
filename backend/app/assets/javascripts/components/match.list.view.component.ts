import {MatchListItem} from "../data/match.list.item";
import {Component, Input} from "@angular/core";
import {MatchListDto} from "../data/match.list.dto";
import {TypeColors} from "../data/typeColors";
import {MatchListService} from "../services/match.list.service";
import { MatchDto } from "app/assets/javascripts/data/match.dto";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html",
})
export class MatchListComponent{

    public matches: Array<MatchListDto> = [];
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
        
        var matchinfo = [];
        if($event.dragData.team1){
            // var matchListItem = new MatchListDto();
            // matchListItem.matchinfo = $event.dragData;
            matchinfo = [$event.dragData];
        }
        if($event.dragData[0]){
            matchinfo = $event.dragData;
        }

        var matchDto = new MatchListDto();
        var matchIds = matchinfo.map(x=>x.match.id);
        
        var matchListItem = new MatchListItem(matchIds);
        matchListItem.position = this.matches.length;
        matchDto.matchListItem = matchListItem;
        matchDto.matchinfo = matchinfo;
        this.matchListService.addMatchListItem(matchListItem).subscribe(
            this.onMatchlistItemAdded.bind(this, matchDto),
            error =>console.log(error)
        );
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
            this.matchListService.deleteMatchListItem(itemToDelete.matchListItem.id).subscribe(this.onMatchlistItemDeleted.bind(this, index));
        }
    }

    onMatchlistItemDeleted(index){
        this.matches.splice(index, 1);
    }
}