import {Component, ViewContainerRef, ViewEncapsulation, ViewChild} from "@angular/core"
import {MatchService} from "../services/match.service"
import {MatchToStringService} from "../services/match.toString.service"
import {ResultModalComponent} from "./result.modal.view.component"
import {IResultHandler} from "../handler/result.handler"

import {MatchDto} from "../data/match.dto"
import {Match} from "../data/match"
import {Type} from "../data/type"
import {ResultEvent} from "../handler/result.event"
import {TableService} from "../services/table.service";
import { WebSocketService } from "../services/web.socket.service";


@Component({
  templateUrl:"assets/javascripts/views/result.view.component.html"
})
export class ResultViewComponent implements IResultHandler{

    public matches: MatchDto[];
    public rowCount: number[];

    private currentMatchIndex: number;
    private currentMatch: MatchDto;
    private currentTypeId: string;

    @ViewChild(ResultModalComponent) resultDialog: ResultModalComponent;

    constructor(private matchService:MatchService,
        public matchToStringService: MatchToStringService, 
        private tableService: TableService,
        private websocketService: WebSocketService) {
            this.reloadMatches("0");
            this.websocketService.OnResultRefresh.subscribe(this.onResultRefresh.bind(this));
    }

    reloadMatches(typeId: any){
        this.currentTypeId = typeId;
        if(typeId === "0"){
            this.matchService.getAllPlayedMatches().subscribe(this.onMatchesLoaded.bind(this));
            return;
        }
        this.matchService.getPlayedMatchesByTypeId(typeId).subscribe(this.onMatchesLoaded.bind(this));
    }

    onResultRefresh(){
        this.reloadMatches(this.currentTypeId);
    }

    onMatchesLoaded(result){
        this.matches = result;
    }

    onTypeChanged(event:string){
        this.reloadMatches(event);
    }

    onResultForMatch(matchIndex){
        this.resultDialog.setResultHandler(this);
        this.currentMatchIndex = matchIndex;
        var match = this.matches[matchIndex];
        this.currentMatch = this.matches[matchIndex];
        this.resultDialog.setMatch(match);
        this.resultDialog.openModal();
    }

    onTakeBackForMatch(matchIndex){
        var match = this.matches[matchIndex];
        this.tableService.takeBackTable([match.match.id]).subscribe(this.onSuccessfullTakeBack.bind(this));
    }

    onSuccessfullTakeBack(){
        this.reloadMatches(this.currentTypeId);
    }

    handleResult(resultToHandle: [number, number][]) {
        var match = this.currentMatch;
        var matchId = match.match.id;
        this.matchService.addResult(resultToHandle, matchId).subscribe(this.handleResultAfterRequestSuccessful.bind(this),
        this.handleErrorsOnService);
    }

    handleResultAfterRequestSuccessful(){
        this.matches.slice(this.currentMatchIndex, 1);
        this.currentMatchIndex = 0;
        this.reloadMatches(this.currentTypeId);
    }

    handleErrorsOnService(error){
        console.log(error);
    }


    
}