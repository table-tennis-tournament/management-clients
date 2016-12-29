import {Component, Input} from "@angular/core";
import {DisciplineTab} from "../data/discipline.tab"
import {DisciplineGroup} from "../data/discipline.group"
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
        this.matchService.getAllMatches().subscribe(this.handleAllMatches.bind(this));
    }

    handleAllMatches(result: MatchDto[]){
        console.log("inside handle all matches");
        var tabList: DisciplineTab[] = [];
        var allPlayerArray: boolean[] = [];
        for(var index=0; index < result.length; index++){
            var currentItem = result[index];
            if(!currentItem.group){
                continue;
            }
            if(!tabList[currentItem.type.id]){
                tabList[currentItem.type.id] = new DisciplineTab(currentItem.type.id, currentItem.type.name);
            }
            var currentItemTab = tabList[currentItem.type.id];
            
            if(!currentItemTab.groups[currentItem.group.id]){
                currentItemTab.groups[currentItem.group.id]=new DisciplineGroup();
                currentItemTab.groups[currentItem.group.id].name = "Gruppe " + currentItem.group.name;
                currentItemTab.groups[currentItem.group.id].bgColor = TypeColors.TYPE_COLORS[currentItem.type.id];
                allPlayerArray = [];
            }
            var currentGroup = currentItemTab.groups[currentItem.group.id];
            currentGroup.matches.push(currentItem);

            if(currentItem.table){
                currentGroup.tableNumbers.push(currentItem.table.number);
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

}