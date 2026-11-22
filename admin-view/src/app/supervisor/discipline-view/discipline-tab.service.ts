import { Injectable } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { DisciplineTab } from './models/discipline.tab.model';
import { Discipline } from '../../discipline/discipline.model';
import { DisciplineGroup } from './models/discipline.group.model';
import { isOver } from '../../shared/match-state/match-state';

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
    let currentItem: Match = null;
    for (let index = 0; index < matches.length; index++) {
      currentItem = matches[index];
      currentItemTab.name = currentItem.type.name;

      if (!currentItem.playGroup) {
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

      if (!currentItemTab.groups[currentItem.playGroup.id]) {
        currentItemTab.groups[currentItem.playGroup.id] = {
          name: 'Gruppe ' + currentItem.playGroup.name,
          tableNumbers: [],
          isComplete: true,
          isMatchActive: this.isMatchActive,
          isPlayerActive: this.isPlayerActive,
          players: [],
          matches: [],
        };
      }
      let currentGroup = currentItemTab.groups[currentItem.playGroup.id];
      currentGroup.matches.push(currentItem);
      currentGroup.isComplete = currentGroup.isComplete && this.isMatchComplete(currentItem);
      currentGroup = this.addTableNumbers(currentItem, currentGroup);

      // per group, so the matches of several groups may come in any order
      for (const player of currentItem.team1.concat(currentItem.team2)) {
        if (!currentGroup.players.some((known) => known.id === player.id)) {
          currentGroup.players.push(player);
        }
      }
    }
    currentItemTab.groups = this.getCleanedGroups(currentItemTab.groups);
    return currentItemTab;
  }

  /** A Completed or Finished (walkover) match counts as done. */
  private isMatchComplete(currentItem: Match) {
    return isOver(currentItem);
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
    // the number people see, not the table id
    if (currentItem.tableNumber && !this.isMatchComplete(currentItem)) {
      currentGroup.tableNumbers.push(currentItem.tableNumber);
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
