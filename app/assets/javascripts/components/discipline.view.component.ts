import {Component, Input} from "@angular/core";
import {DisciplineTab} from "../data/discipline.tab"
import {DisciplineGroup} from "../data/discipline.group"
import {DisciplineStage} from "../data/discipline.stage"
import {MatchDto} from "../data/match.dto"
import {TypeColors} from "../data/typeColors"
import {RandomMatchService} from "../services/random.match.service"
import {MatchService} from "../services/match.service"

@Component({
    selector: "discipline-view",
    templateUrl : "assets/javascripts/views/discipline.view.component.html"
})
export class DisciplineViewComponent{
    public tabs: DisciplineTab[];
    

    constructor(private randomMatchService: RandomMatchService, private matchService: MatchService){
        this.onFilterSelected();
        console.log("start discipline view");
    }

    onFilterSelected(){
        this.matchService.getAllMatches().subscribe(this.handleAllMatches.bind(this));
    }

    handleAllMatches(result: MatchDto[]){
        console.log("inside handle all matches");
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
        this.tabs[0].isActive = true;
    }

    clearTabList(tabListToClean: DisciplineTab[]): DisciplineTab[]{
        var cleanedResult: DisciplineTab[] = [];
        tabListToClean.forEach(element => {
           if(element){
               element.groups = this.getCleanedGroups(element.groups);
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

    onCollapseAll(){
        this.setValuesOnTabs(false, false);
    }

    onOpenPlayers(){
        this.setValuesOnTabs(false, true);
    }

    onOpenAll(){
        this.setValuesOnTabs(true, true);
    }

    setValuesOnTabs(isMatchActive: boolean, isPlayerActive:boolean){
        console.log("start iterating ...");
        for(var index = 0; index < this.tabs.length; index++){
            this.tabs[index].groups.forEach(function(element){
                element.isMatchActive =true;
                element.isPlayerActive = true;
            });
        }
        console.log("end iterating ...");
        this.tabs = this.tabs;
    }

}