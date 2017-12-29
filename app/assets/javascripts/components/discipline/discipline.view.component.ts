import {Component, Input, EventEmitter, ViewChild} from "@angular/core";
import {DisciplineTab} from "../../data/discipline.tab"
import {DisciplineGroup} from "../../data/discipline.group"
import {DisciplineStage} from "../../data/discipline.stage"
import {MatchDto} from "../../data/match.dto"
import {Type} from "../../data/type"
import {TypeColors} from "../../data/typeColors"
import {RandomMatchService} from "../../services/random.match.service"
import {MatchService} from "../../services/match.service"
import {MaterializeAction} from "angular2-materialize";
import { StatusDto } from "../../data/status.dto";
import { ResultModalComponent } from "../../components/result.modal.view.component";
import { ResultMatchHandler } from "../../handler/result.match.handler";
import { ToastService } from "../../services/toast.service";
import { MatchHelperService } from "../../services/match.helper.service";

@Component({
    selector: "discipline-view",
    templateUrl : "assets/javascripts/views/discipline/discipline.view.component.html"
})
export class DisciplineViewComponent{
    public tabs: DisciplineTab[];
    public colors: string[];
    public selectedTab: DisciplineTab;
    public modalActions = new EventEmitter<string|MaterializeAction>();
    public rowCount: number[];

    @ViewChild(ResultModalComponent) resultDialog: ResultModalComponent;

    constructor(private randomMatchService: RandomMatchService, 
        private matchService: MatchService, 
        private toastService: ToastService,
        private matchHelperService: MatchHelperService)
    {
        this.onFilterSelected();
        this.colors = TypeColors.TYPE_COLORS;
    }

    onTabSelected(selectedTab: DisciplineTab){
        this.selectedTab = selectedTab;
        this.setTabForId(selectedTab.id);
    }

    onRefreshCurrentTab(){
        this.onTabSelected(this.selectedTab);
    }

    onFilterSelected(){
        this.matchService.getAllOpenTypes().subscribe(this.allTypesSelected.bind(this))
    }

    allTypesSelected(result: Type[]){
        this.tabs = [];
        var newTabs = []
        for(var index = 0; index < result.length; index++){
            var currentType = result[index];
            newTabs.push(new DisciplineTab(currentType.id, currentType.name, currentType.kind));
        }
        this.tabs = newTabs;
        this.selectedTab = this.tabs[0];
        if(this.tabs && this.tabs[0]!== null){
            this.setTabForId(this.tabs[0].id);
        }
        this.rowCount = Array.from(Array(Math.ceil(this.tabs.length / 12)).keys());
    }

    onDeleteStage($event: DisciplineStage){
        var index = this.selectedTab.stages.indexOf($event);
        this.selectedTab.stages.splice(index, 1);
    }

    setTabForId(tabId: number){
        this.matchService.getMatchesByType(tabId).subscribe(this.handleSetSelectedTab.bind(this), error => console.log(error));
    }

    onResultForMatch($event){
        var resultHandler = new ResultMatchHandler(this.matchService);
        resultHandler.onRefresh.subscribe(this.onRefreshCurrentTab.bind(this));
        this.resultDialog.setResultHandler(resultHandler);
        this.resultDialog.setMatch($event.match);
        this.resultDialog.openModal();
    }
    
    handleSetSelectedTab(result: MatchDto[]){
        this.selectedTab = this.matchHelperService.getSingle(result, this.selectedTab);
    }
   
    onOpenPlayers(){
        this.randomMatchService.expandPlayer();
    }

    onSyncMatches(){
        this.matchService.syncMatches().subscribe(this.onSuccessfullSync.bind(this));
    }

    onSuccessfullSync(status: StatusDto){
        this.onRefreshCurrentTab();
        this.toastService.toast("Spiele erfolgreich geladen. Nachricht: " + status.message);
    }

    closeModal() {
        this.modalActions.emit({action:"modal",params:["close"]});
    }

    onOpenAll(){
        this.randomMatchService.expandMatches();
    }
}