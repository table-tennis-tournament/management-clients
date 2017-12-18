import {MatchListItem} from "../data/match.list.item";
import {Component, Input} from "@angular/core";
import {MatchListDto} from "../data/match.list.dto";
import {TypeColors} from "../data/typeColors";
import {MatchListService} from "../services/match.list.service";
import { MatchDto } from "../data/match.dto";
import { StatusDto } from "../data/status.dto";
import { WebSocketService } from "../services/web.socket.service";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html",
})
export class MatchListComponent{

    public matches: Array<MatchListDto> = [];
    public colorArray: string[] = [];

    constructor(private matchListService: MatchListService,
                private websocketService: WebSocketService){
       this.loadWaitingList();
       this.colorArray = TypeColors.TYPE_COLORS;
       this.websocketService.OnWaitinglistRefresh.subscribe(this.onWaitinglistRefresh.bind(this));
    }

    private getAllMatchesSuccess(matches: MatchListDto[]){
        this.matches = matches;
    }
    private getAllMatchesError(error){
        console.log("error on get All matches for waitinglist");
        console.log(error);
    }

    onWaitinglistRefresh(){
        this.loadWaitingList();
    }

    loadWaitingList(){
        this.matchListService.getCompleteMatchlist().subscribe(
            this.getAllMatchesSuccess.bind(this),
            this.getAllMatchesError
        )
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

    onMatchlistItemAdded(matchListItem: MatchListDto, status: StatusDto){
        // matchListItem.matchListItem.id = status.data;
        // this.matches.push(matchListItem);
    }

    onDropSuccess($event){
        var matchListItem = $event.match.matchListItem;
        var newPosition = this.getListIndex($event.match.matchListItem.id);
        this.matchListService.transferMatchListItem(matchListItem, newPosition).subscribe(this.onMatchlistAdded.bind(this, $event.match.matchListItem));
    }

    onMatchlistAdded(match: MatchListItem, status: StatusDto){
        console.log(status);
        // this.matches[match.position].matchListItem.id = status.data;
    }

    getListIndex(matchListId){
        var currentMatch = null;
        for(var index = 0; index < this.matches.length; index++){
            currentMatch = this.matches[index];
            if(currentMatch.matchListItem.id === matchListId){
                return index;
            }
        }
        return this.matches.length;
    }

    onDelete(index){
        if (index > -1 && this.matches) {
            var itemToDelete = this.matches[index];
            this.matchListService.deleteMatchListItem(itemToDelete.matchListItem.id).subscribe(this.onMatchlistItemDeleted.bind(this, index));
        }
    }

    onMatchlistItemDeleted(index){
        if(index < 0){
            return;
        }
        this.matches.splice(index, 1);
    }
}