import {Injectable} from "@angular/core"
import {DisciplineTab} from "../data/discipline.tab";
import {DisciplineStage} from "../data/discipline.stage";
import {DisciplineGroup} from "../data/discipline.group";
import {TypeColors} from "../data/typeColors";
import {MatchDto} from "../data/match.dto"

@Injectable()
export class MatchHelperService {


  constructor(){}

  createTabsFromMatches(result: MatchDto[]):DisciplineTab[]{
    var endResult = new Array<DisciplineTab>();
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

        var allPlayers = currentItem.team1.concat(currentItem.team2);
        for(var playerIndex = 0; playerIndex < allPlayers.length; playerIndex++){
            if(!allPlayerArray[allPlayers[playerIndex].id]){
                currentGroup.players.push(allPlayers[playerIndex]);
                allPlayerArray[allPlayers[playerIndex].id] = true;
            }
        }
        
    }
    endResult = this.clearTabList(tabList);
    return endResult;
  }

  getSingle(result: MatchDto[], currentItemTab: DisciplineTab, isPlayerActive: boolean = true, isMatchActive: boolean = false):DisciplineTab{
    currentItemTab.groups = [];
    currentItemTab.stages = [];
    var allStages:number[] = [];
    var currentIndex:number = 0;
    var allPlayerArray: boolean[] = [];
    var currentItem: MatchDto = null;
    for(var index=0; index < result.length; index++){
        currentItem = result[index];

        if(!currentItem.group)
        {
             var localIndex = allStages[currentItem.matchType.name];
             var currentStage = currentItemTab.stages[localIndex];
             if(!currentStage)
             {
                 allStages[currentItem.matchType.name] = currentIndex;
                 currentItemTab.stages[currentIndex] = new DisciplineStage();
                 currentItemTab.stages[currentIndex].name = currentItem.matchType.name;
                 currentItemTab.stages[currentIndex].bgColor = TypeColors.TYPE_COLORS[currentItem.type.id];
                 currentItemTab.stages[currentIndex].isComplete = true;
                 currentStage = currentItemTab.stages[currentIndex];
                 currentIndex++;
             }
             if(currentItem.match.isPlayed !== true){
                 currentStage.isComplete = false;
             }
             
             currentStage.matches.push(currentItem);
            continue;
        }
        
        if(!currentItemTab.groups[currentItem.group.id])
        {
            currentItemTab.groups[currentItem.group.id]=new DisciplineGroup();
            currentItemTab.groups[currentItem.group.id].name = "Gruppe " + currentItem.group.name;
            currentItemTab.groups[currentItem.group.id].bgColor = TypeColors.TYPE_COLORS[currentItem.type.id];
            currentItemTab.groups[currentItem.group.id].tableNumbers = [];
            currentItemTab.groups[currentItem.group.id].isComplete = true;
            currentItemTab.groups[currentItem.group.id].isMatchActive = isMatchActive;
            currentItemTab.groups[currentItem.group.id].isPlayerActive = isPlayerActive;
            
            allPlayerArray = [];
        }
        var currentGroup = currentItemTab.groups[currentItem.group.id];
        currentGroup.matches.push(currentItem);

        if(currentItem.match.result == null){
            currentGroup.isComplete = false;
        }

        if(currentItem.table[0]){
            if(currentItem.match.isPlayed === false){
                currentGroup.tableNumbers.push(currentItem.table[0]);
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
    return currentItemTab;
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


}
