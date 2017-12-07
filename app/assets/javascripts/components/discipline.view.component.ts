import {Component, Input, EventEmitter, ViewChild} from "@angular/core";
import {DisciplineTab} from "../data/discipline.tab"
import {DisciplineGroup} from "../data/discipline.group"
import {DisciplineStage} from "../data/discipline.stage"
import {MatchDto} from "../data/match.dto"
import {Type} from "../data/type"
import {TypeColors} from "../data/typeColors"
import {RandomMatchService} from "../services/random.match.service"
import {MatchService} from "../services/match.service"
import {MaterializeAction} from "angular2-materialize";
import { StatusDto } from "../data/status.dto";
import { ResultModalComponent } from "../components/result.modal.view.component";
import { ResultMatchHandler } from "../handler/result.match.handler";
import { ToastService } from "../services/toast.service";

@Component({
    selector: "discipline-view",
    templateUrl : "assets/javascripts/views/discipline.view.component.html"
})
export class DisciplineViewComponent{
    public tabs: DisciplineTab[];
    public colors: string[];
    public selectedTab: DisciplineTab;
    public modalActions = new EventEmitter<string|MaterializeAction>();
    public rowCount: number[];

    @ViewChild(ResultModalComponent) resultDialog: ResultModalComponent;

    constructor(private randomMatchService: RandomMatchService, private matchService: MatchService, private toastService: ToastService){
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
        var currentItemTab = this.selectedTab;
        currentItemTab.groups = [];
        currentItemTab.stages = [];
        var allStages:number[] = [];
        var currentIndex:number = 0;
        var allPlayerArray: boolean[] = [];
        var currentItem = null;
        for(var index=0; index < result.length; index++){
            currentItem = result[index];

            if(!currentItem.group){
                 var localIndex = allStages[currentItem.matchType.name];
                 var currentStage = currentItemTab.stages[localIndex];
                 if(!currentStage){
                     allStages[currentItem.matchType.name] = currentIndex;
                     currentItemTab.stages[currentIndex] = new DisciplineStage();
                     currentItemTab.stages[currentIndex].name = currentItem.matchType.name;
                     currentItemTab.stages[currentIndex].bgColor = TypeColors.TYPE_COLORS[currentItem.type.id];
                     currentStage = currentItemTab.stages[currentIndex];
                     currentIndex++;
                 }
                 
                 currentStage.matches.push(currentItem);
                continue;
            }
            
            if(!currentItemTab.groups[currentItem.group.id]){
                currentItemTab.groups[currentItem.group.id]=new DisciplineGroup();
                currentItemTab.groups[currentItem.group.id].name = "Gruppe " + currentItem.group.name;
                currentItemTab.groups[currentItem.group.id].bgColor = TypeColors.TYPE_COLORS[currentItem.type.id];
                currentItemTab.groups[currentItem.group.id].tableNumbers = [];
                allPlayerArray = [];
            }
            var currentGroup = currentItemTab.groups[currentItem.group.id];
            currentGroup.matches.push(currentItem);

            if(currentItem.table){
                if(currentItem.match.isPlayed === false){
                    currentGroup.tableNumbers.push(currentItem.table.number);
                }
            }
            
            var allPlayers = currentItem.team1.concat(currentItem.team2);
            for(var playerIndex = 0; playerIndex < allPlayers.length; playerIndex++){
                if(!allPlayerArray[allPlayers[playerIndex].id]){
                    currentGroup.players.push(allPlayers[playerIndex]);
                    allPlayerArray[allPlayers[playerIndex].id] = true;
                }
            }
            
        }
        currentItemTab.groups = this.getCleanedGroups(currentItemTab.groups);
        this.selectedTab = currentItemTab;
    }

    handleAll(result: MatchDto[]){
        console.log("inside handle all ");
        var tabList: DisciplineTab[] = [];
        var allPlayerArray: boolean[] = [];
        var allStages:number[] = [];
        var currentIndex:number = 0;
        for(var index=0; index < result.length; index++){
            var currentItem = result[index];
           
            if(!tabList[currentItem.type.id]){
                allStages = [];
                currentIndex = 0;
                tabList[currentItem.type.id] = new DisciplineTab(currentItem.type.id, currentItem.type.name, currentItem.type.kind);
            }
            var currentItemTab = tabList[currentItem.type.id];

             if(!currentItem.group){
                 var localIndex = allStages[currentItem.matchType.name];
                 var currentStage = currentItemTab.stages[localIndex];
                 if(!currentStage){
                     allStages[currentItem.matchType.name] = currentIndex;
                     currentItemTab.stages[currentIndex] = new DisciplineStage();
                     currentItemTab.stages[currentIndex].name = currentItem.matchType.name;
                     currentStage = currentItemTab.stages[currentIndex];
                     currentIndex++;
                 }
                 
                 currentStage.matches.push(currentItem);
                continue;
            }
            
            if(!currentItemTab.groups[currentItem.group.id]){
                currentItemTab.groups[currentItem.group.id]=new DisciplineGroup();
                currentItemTab.groups[currentItem.group.id].name = "Gruppe " + currentItem.group.name;
                currentItemTab.groups[currentItem.group.id].bgColor = TypeColors.TYPE_COLORS[currentItem.type.id];
                currentItemTab.groups[currentItem.group.id].tableNumbers = [];
                allPlayerArray = [];
            }
            var currentGroup = currentItemTab.groups[currentItem.group.id];
            currentGroup.matches.push(currentItem);

            if(currentItem.table){
                if(currentItem.match.isPlayed === false){
                    currentGroup.tableNumbers.push(currentItem.table.number);
                }
            }
            
            var allPlayers = currentItem.team1.concat(currentItem.team2);
            for(var playerIndex = 0; playerIndex < allPlayers.length; playerIndex++){
                if(!allPlayerArray[allPlayers[playerIndex].id]){
                    currentGroup.players.push(allPlayers[playerIndex]);
                    allPlayerArray[allPlayers[playerIndex].id] = true;
                }
            }
            
        }
        this.tabs = this.clearTabList(tabList);
        if(this.tabs.length > 0){
            this.tabs[0].isActive = true;
        }
        
    }

    clearTabList(tabListToClean: DisciplineTab[]): DisciplineTab[]{
        var cleanedResult: DisciplineTab[] = [];
        tabListToClean.forEach(element => {
           if(element){
               element.groups = this.getCleanedGroups(element.groups);
               element.stages = this.getCleanedStages(element.stages);
               cleanedResult.push(element);
           } 
        });
        return cleanedResult;
    }

    getCleanedStages(stagesToClean: DisciplineStage[]){
        var cleanedResult: DisciplineStage[] = [];
        stagesToClean.forEach(element => {
           if(element){
               cleanedResult.push(element);
           } 
        });
        return cleanedResult;
    }

    getCleanedGroups(groupsToClean: DisciplineGroup[]){
        var cleanedResult: DisciplineGroup[] = [];
        groupsToClean.forEach(element => {
           if(element){
               cleanedResult.push(element);
           } 
        });
        return cleanedResult;
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