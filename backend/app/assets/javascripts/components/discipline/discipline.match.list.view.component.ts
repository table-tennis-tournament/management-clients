import {Component, Input} from "@angular/core";
import {MatchDto} from "../../data/match.dto";
import {MatchListDto} from "../../data/match.list.dto";
import {TypeColors} from "../../data/typeColors";
import {DisciplineShortcuts} from "../../data/disciplineShortcuts";
import {Type} from "../../data/type";
import {MatchListService} from "../../services/match.list.service";
import {MatchService} from "../../services/match.service";
import { WebSocketService } from "../../services/web.socket.service";

@Component({
    selector: "discipline-match-list",
    templateUrl : "assets/javascripts/views/discipline/discipline.match.list.view.component.html",
})
export class DisciplineMatchListComponent{

    public matches: Array<MatchDto>;
    public colorArray: string[];
    public disciplines:Array<Type>;
    public selectedDiscipline:any;
    public disciplineType:string[];

    constructor(private matchListService: MatchListService, private matchService: MatchService, private websocketService: WebSocketService){
        this.selectedDiscipline = "-1";
        this.onDisciplineChanged(this.selectedDiscipline);
        this.colorArray = TypeColors.TYPE_COLORS;
        this.disciplineType = DisciplineShortcuts.TYPE;
        this.websocketService.OnWaitinglistRefresh.subscribe(this.onWaitinglistRefresh.bind(this));
        this.websocketService.OnTableRefresh.subscribe(this.onRefreshList.bind(this));
        this.websocketService.OnMatchResult.subscribe(this.onRefreshList.bind(this));
    }

    private getAllMatches(){
        this.matchService.getAllOpenMatches().subscribe(
            this.getAllMatchesSuccess.bind(this),
            this.getAllMatchesError
        );
    }

    private getAllMatchesSuccess(matches: MatchDto[]){
        this.matches = matches;
    }
    private getAllMatchesError(error){
        console.log("error on get All matches");
        console.log(error);
    }

    onWaitinglistRefresh(){
        if(this.selectedDiscipline === "-1"){
            this.getWaitingList();
        }
    }

    public onTableAssigned(dragData: any){
        if(!dragData.matches){
            return;
        }
        this.onDisciplineChanged(this.selectedDiscipline);
    }

    isMatchInGroup(groupId: number, currentMatch: MatchDto){
        return  currentMatch !== null && 
        currentMatch !== undefined && 
        currentMatch.group !== null &&
        currentMatch.group !== undefined &&
        currentMatch.group.id === groupId;
    }

    public onDragStart($event){
        if($event.dragData.isGroup === true){
            var groupId = $event.dragData.matches[0].group.id
            var groupMatches = this.matches.filter(x=> this.isMatchInGroup(groupId, x));
            $event.dragData.matches = groupMatches; 
        }
    }

    onTypeChanged(event){
        this.onDisciplineChanged(event);
    }

    onRefreshList(){
        this.onDisciplineChanged(this.selectedDiscipline);
    }

    onDisciplineChanged(typeId: any){
        this.selectedDiscipline = typeId;
        if (this.selectedDiscipline === "0" || this.selectedDiscipline === 0){
            this.getAllMatches();
            return;
        }
        if (this.selectedDiscipline === "-1" || this.selectedDiscipline === -1){
            this.getWaitingList();
            return;
        }
        this.matchService.getOpenMatchesByType(this.selectedDiscipline).subscribe(this.matchesChanged.bind(this));
    }


    getWaitingList(){
        this.matchListService.getCompleteMatchlist().subscribe(this.onMatchlistLoaded.bind(this));
    }

    onMatchlistLoaded(matches: MatchListDto[]){
        this.matches = [];
        if(matches === null || matches === undefined){
            console.log("Empty Matches on matchlist loaded");
            return;
        }
        matches.forEach(element => {
            if(element !== null && element !== undefined && element.matchinfo !== null){
                element.matchinfo.forEach(y => this.matches.push(y));
            }
        });
    }

    matchesChanged(matches: MatchDto[]){
        this.matches = matches;
    }

   
}