import { Injectable } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { DisciplineTab } from './models/discipline.tab.model';
import { Discipline } from '../../discipline/discipline.model';
import { DisciplineGroup } from './models/discipline.group.model';
import { MatchState } from '../../shared/data/matchstate.model';

@Injectable({
  providedIn: 'root',
})
// TODO: do this on server
export class DisciplineTabService {
  isMatchActive = true;
  isPlayerActive = true;

  public getTabForMatches(matches: Match[]): DisciplineTab {
    const currentItemTab: DisciplineTab = {
      groups: [],
      stages: [],
    };
    if (matches == null || matches.length < 1) {
      return currentItemTab;
    }
    currentItemTab.id = matches[0].type.id;
    const allStages: number[] = [];
    let currentIndex = 0;
    let allPlayerArray: boolean[] = [];
    let currentItem: Match = null;
    for (let index = 0; index < matches.length; index++) {
      currentItem = matches[index];

      if (!currentItem.group) {
        const localIndex = allStages[currentItem.matchType.name];
        let currentStage = currentItemTab.stages[localIndex];
        if (!currentStage) {
          allStages[currentItem.matchType.name] = currentIndex;
          currentItemTab.stages[currentIndex] = {
            name: currentItem.matchType.name,
            isComplete: true,
            matches: [],
            id: currentItem.type.id,
          };
          currentStage = currentItemTab.stages[currentIndex];
          currentIndex++;
        }
        currentStage.isComplete = currentStage.isComplete && this.isMatchComplete(currentItem);

        currentStage.matches.push(currentItem);
        continue;
      }

      if (!currentItemTab.groups[currentItem.group.id]) {
        currentItemTab.groups[currentItem.group.id] = {
          name: 'Gruppe ' + currentItem.group.name,
          tableNumbers: [],
          isComplete: true,
          isMatchActive: this.isMatchActive,
          isPlayerActive: this.isPlayerActive,
          players: [],
          matches: [],
        };

        allPlayerArray = [];
      }
      let currentGroup = currentItemTab.groups[currentItem.group.id];
      currentGroup.matches.push(currentItem);
      currentGroup.isComplete = currentGroup.isComplete && this.isMatchComplete(currentItem);
      currentGroup = this.addTableNumbers(currentItem, currentGroup);

      const allPlayers = currentItem.team1.concat(currentItem.team2);
      for (let playerIndex = 0; playerIndex < allPlayers.length; playerIndex++) {
        if (!allPlayerArray[allPlayers[playerIndex].id]) {
          currentGroup.players.push(allPlayers[playerIndex]);
          allPlayerArray[allPlayers[playerIndex].id] = true;
        }
      }
    }
    currentItemTab.groups = this.getCleanedGroups(currentItemTab.groups);
    return currentItemTab;
  }

  private isMatchComplete(currentItem: Match) {
    return MatchState[currentItem.state] === MatchState.Completed;
  }

  public getTabsForDisciplines(disciplines: Discipline[]): DisciplineTab[] {
    return disciplines.map((discipline) => {
      return {
        id: discipline.id,
        name: discipline.name,
        groups: [],
        stages: [],
        isActive: discipline.active,
      };
    });
  }

  private addTableNumbers(currentItem: Match, currentGroup: DisciplineGroup): DisciplineGroup {
    if (currentItem.table[0] && !this.isMatchComplete(currentItem)) {
      currentGroup.tableNumbers.push(currentItem.table[0]);
    }
    return currentGroup;
  }

  getCleanedGroups(groupsToClean: DisciplineGroup[]) {
    const cleanedResult: DisciplineGroup[] = [];
    groupsToClean.forEach((element) => {
      if (element) {
        cleanedResult.push(element);
      }
    });
    return cleanedResult;
  }
}
