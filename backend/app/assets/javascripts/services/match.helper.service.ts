import {Injectable} from "@angular/core"
import {DisciplineTab} from "../data/discipline.tab";
import {DisciplineStage} from "../data/discipline.stage";
import {DisciplineGroup} from "../data/discipline.group";
import {TypeColors} from "../data/typeColors";
import {Match} from '../data/match';

@Injectable()
export class MatchHelperService {


  constructor(){}

  createTabsFromMatches(result: Match[]):DisciplineTab[]{
      let endResult: DisciplineTab[];
      const tabList: DisciplineTab[] = [];
      let allPlayerArray: boolean[] = [];
      let allStages: number[] = [];
      let currentIndex: number = 0;
      for(let index=0; index < result.length; index++){
        const currentItem = result[index];

        if(!tabList[currentItem.type.id]){
            allStages = [];
            currentIndex = 0;
            tabList[currentItem.type.id] = new DisciplineTab(currentItem.type.id, currentItem.type.name, currentItem.type.kind);
        }
        const currentItemTab = tabList[currentItem.type.id];

        if(!currentItem.group){
             const localIndex = allStages[currentItem.matchType.name];
             let currentStage = currentItemTab.stages[localIndex];
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
        const currentGroup = currentItemTab.groups[currentItem.group.id];
        currentGroup.matches.push(currentItem);

        const allPlayers = currentItem.team1.concat(currentItem.team2);
        for(let playerIndex = 0; playerIndex < allPlayers.length; playerIndex++){
            if(!allPlayerArray[allPlayers[playerIndex].id]){
                currentGroup.players.push(allPlayers[playerIndex]);
                allPlayerArray[allPlayers[playerIndex].id] = true;
            }
        }
        
    }
    endResult = this.clearTabList(tabList);
    return endResult;
  }

  getSingle(result: Match[], currentItemTab: DisciplineTab, isPlayerActive: boolean = true, isMatchActive: boolean = false):DisciplineTab{
    currentItemTab.groups = [];
    currentItemTab.stages = [];
      const allStages: number[] = [];
      let currentIndex: number = 0;
      let allPlayerArray: boolean[] = [];
      let currentItem: Match = null;
      for(let index=0; index < result.length; index++){
        currentItem = result[index];

        if(!currentItem.group)
        {
            const localIndex = allStages[currentItem.matchType.name];
            let currentStage = currentItemTab.stages[localIndex];
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
             if(currentItem.isPlayed !== true){
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
        const currentGroup = currentItemTab.groups[currentItem.group.id];
        currentGroup.matches.push(currentItem);

        if(currentItem.result == null || currentItem.result === ""){
            currentGroup.isComplete = false;
        }

        if(currentItem.table[0]){
            if(currentItem.isPlayed === false){
                currentGroup.tableNumbers.push(currentItem.table[0]);
            }
        }

        const allPlayers = currentItem.team1.concat(currentItem.team2);
        for(let playerIndex = 0; playerIndex < allPlayers.length; playerIndex++){
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
      const cleanedResult: DisciplineTab[] = [];
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
    const cleanedResult: DisciplineStage[] = [];
    stagesToClean.forEach(element => {
       if(element){
           cleanedResult.push(element);
       } 
    });
    return cleanedResult;
}

getCleanedGroups(groupsToClean: DisciplineGroup[]){
    const cleanedResult: DisciplineGroup[] = [];
    groupsToClean.forEach(element => {
       if(element){
           cleanedResult.push(element);
       } 
    });
    return cleanedResult;
}


}
