import {MatchListItem} from "../data/match.list.item";
import {Component} from "@angular/core";
import {MatchListDto} from "../data/match.list.dto";
import {TypeColors} from "../data/typeColors";
import {MatchListService} from "../services/match.list.service";
import {StatusDto} from "../data/status.dto";
import {WebSocketService} from "../services/web.socket.service";
import {ToastService} from "../services/toast.service";

@Component({
    selector: "match-list",
    templateUrl : "assets/javascripts/views/match.list.view.component.html",
})
export class MatchListComponent{

    public matches: Array<MatchListDto> = [];
    public colorArray: string[] = [];

    constructor(private matchListService: MatchListService,
                private websocketService: WebSocketService,
                private toastService: ToastService){
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
        let matchinfo = [];
        if($event.dragData.team1){
            // var matchListItem = new MatchListDto();
            // matchListItem.matchinfo = $event.dragData;
            matchinfo = [$event.dragData];
        }
        if($event.dragData[0]){
            matchinfo = $event.dragData;
        }

        const matchDto = new MatchListDto();
        const matchIds = matchinfo.map(x => x.id);

        const matchListItem = {
            matchIds: matchIds,
            position: this.matches.length,
        };
        matchDto.matchListItem = matchListItem;
        matchDto.matchinfo = matchinfo;
        this.matchListService.addMatchListItem(matchListItem).subscribe(
            this.onMatchlistItemAdded.bind(this, matchDto),
            this.onMatchlistAddError.bind(this)
        );
    }

    onMatchlistItemAdded(matchListItem: MatchListDto, status: StatusDto){
        // matchListItem.matchListItem.id = status.data;
        // this.matches.push(matchListItem);
    }

    onDropSuccess($event){
        const matchListItem = $event.match.matchListItem;
        const newPosition = this.getListIndex($event.match.matchListItem.id);
        this.matchListService.transferMatchListItem(matchListItem, newPosition).subscribe(this.onMatchlistAdded.bind(this, $event.match.matchListItem), this.onMatchlistAddError.bind(this));
    }

    onMatchlistAdded(match: MatchListItem, status: StatusDto){
        console.log(status);
        // this.matches[match.position].matchListItem.id = status.data;
    }

    onMatchlistAddError(status:StatusDto){
        this.toastService.toast(status.message);
    }

    getListIndex(matchListId){
        let currentMatch = null;
        for(let index = 0; index < this.matches.length; index++){
            currentMatch = this.matches[index];
            if(currentMatch.matchListItem.id === matchListId){
                return index;
            }
        }
        return this.matches.length;
    }

    onDelete(index){
        if (index > -1 && this.matches) {
            const itemToDelete = this.matches[index];
            this.matchListService.deleteMatchListItem(itemToDelete.matchListItem.id).subscribe(this.onMatchlistItemDeleted.bind(this, index));
        }
    }

    onMatchlistItemDeleted(index){
        // if(index < 0){
        //     return;
        // }
        // this.matches.splice(index, 1);
    }
}