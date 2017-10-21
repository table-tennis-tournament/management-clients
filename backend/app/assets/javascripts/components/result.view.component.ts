import {Component, ViewContainerRef, ViewEncapsulation, ViewChild} from "@angular/core"
import {MatchService} from "../services/match.service"
import {MatchToStringService} from "../services/match.toString.service"
import {ResultModalComponent} from "./result.modal.view.component"
import {IResultHandler} from "../handler/result.handler"

import {MatchDto} from "../data/match.dto"
import {Match} from "../data/match"
import {Type} from "../data/type"
import {ResultEvent} from "../handler/result.event"


@Component({
  templateUrl:"assets/javascripts/views/result.view.component.html"
})
export class ResultViewComponent implements IResultHandler{

    public matches: MatchDto[];
    public rowCount: number[];

    private currentMatchIndex: number;
    private currentTypeId: number;

    @ViewChild(ResultModalComponent) resultDialog: ResultModalComponent;

    constructor(private matchService:MatchService,
        public matchToStringService: MatchToStringService) {
            this.reloadMatches(0);
    }

    reloadMatches(typeId: number){
        this.currentTypeId = typeId;
        if(typeId < 1){
            this.matchService.getAllPlayedMatches().subscribe(this.onMatchesLoaded.bind(this));
        }
        this.matchService.getPlayedMatchesByTypeId(typeId).subscribe(this.onMatchesLoaded.bind(this));
    }

    onMatchesLoaded(result){
        this.matches = result;
    }

    onRefreshMatchesClicked(){
        this.reloadMatches(this.currentTypeId);
    }

    onTypeChanged(event:any){
        this.reloadMatches(event);
    }

    onResultForMatch(matchIndex){
        this.resultDialog.setResultHandler(this);
        this.currentMatchIndex = matchIndex;
        var match = this.matches[matchIndex];
        this.resultDialog.setMatch(match);
        this.resultDialog.openModal();
    }

    handleResult(resultToHandle: [number, number][]) {
        var match = this.matches[this.currentMatchIndex];
        var matchId = match.match.id;
        this.matchService.addResult(resultToHandle, matchId).subscribe(this.handleResultAfterRequestSuccessful.bind(this),
        this.handleErrorsOnService);
    }

    handleResultAfterRequestSuccessful(){
        this.matches.slice(this.currentMatchIndex, 1);
        this.currentMatchIndex = 0;
    }

    handleErrorsOnService(error){
        console.log(error);
    }


    
}