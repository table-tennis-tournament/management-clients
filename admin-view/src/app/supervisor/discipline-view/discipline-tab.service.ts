import { Injectable } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { DisciplineTab } from './models/discipline.tab.model';
import { Discipline } from '../../discipline/discipline.model';
import { DisciplineGroup } from './models/discipline.group.model';
import { DisciplineStage } from './models/discipline.stage.model';
import { isOver } from '../../shared/match-state/match-state';

@Injectable({
  providedIn: 'root',
})
// TODO: do this on server
export class DisciplineTabService {
  isMatchActive = true;
  isPlayerActive = true;

  public getTabForMatches(matches: Match[] | null): DisciplineTab {
    const currentItemTab: DisciplineTab = {
      groups: [],
      stages: [],
    };
    if (matches == null || matches.length < 1) {
      return currentItemTab;
    }
    currentItemTab.id = matches[0].type?.id;
    // the knockout stages in the order they first appear, by name
    const stagesByName = new Map<string, DisciplineStage>();
    for (const match of matches) {
      currentItemTab.name = match.type?.name;

      if (!match.playGroup) {
        const name = match.matchType?.name ?? '';
        let currentStage = stagesByName.get(name);
        if (!currentStage) {
          currentStage = { name, isComplete: true, matches: [], id: match.type?.id };
          stagesByName.set(name, currentStage);
          currentItemTab.stages.push(currentStage);
        }
        currentStage.isComplete = currentStage.isComplete && this.isMatchComplete(match);
        currentStage.matches.push(match);
        continue;
      }

      // indexed by group id, so the groups come out sorted by id; a group without an id is not shown
      const groupId = match.playGroup.id;
      if (groupId == null) {
        continue;
      }
      if (!currentItemTab.groups[groupId]) {
        currentItemTab.groups[groupId] = {
          name: 'Gruppe ' + match.playGroup.name,
          tableNumbers: [],
          isComplete: true,
          isMatchActive: this.isMatchActive,
          isPlayerActive: this.isPlayerActive,
          players: [],
          matches: [],
        };
      }
      const currentGroup = currentItemTab.groups[groupId];
      currentGroup.matches.push(match);
      currentGroup.isComplete = currentGroup.isComplete && this.isMatchComplete(match);
      this.addTableNumbers(match, currentGroup);

      // per group, so the matches of several groups may come in any order
      for (const player of [...(match.team1 ?? []), ...(match.team2 ?? [])]) {
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

  private addTableNumbers(currentItem: Match, currentGroup: DisciplineGroup): void {
    // the number people see, not the table id
    if (currentItem.tableNumber && !this.isMatchComplete(currentItem)) {
      currentGroup.tableNumbers.push(currentItem.tableNumber);
    }
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
