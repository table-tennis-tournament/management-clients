import { Injectable } from '@angular/core';
import { DisciplineGroup } from '../data/discipline.group';
import { DisciplineTab } from '../data/discipline.tab';
import { isOver } from '../../shared/match-state/match-state';
import { Match } from '../data/match';
import { GroupStandings, StandingLine } from '../data/standing';
import { Player } from '../data/player';

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
    const allStages: number[] = [];
    let currentIndex = 0;
    let currentItem: Match = null;
    for (const match of matches) {
      currentItem = match;

      if (!currentItem.playGroup) {
        const localIndex = allStages[currentItem.matchType.name];
        let currentStage = currentItemTab.stages[localIndex];
        if (!currentStage) {
          allStages[currentItem.matchType.name] = currentIndex;
          currentItemTab.stages[currentIndex] = {
            name: currentItem.matchType.name,
            isComplete: true,
            matches: [],
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
          id: currentItem.playGroup.id,
          name: 'Gruppe ' + currentItem.playGroup.name,
          isComplete: true,
          isMatchActive: this.isMatchActive,
          isPlayerActive: this.isPlayerActive,
          players: [],
          matches: [],
        };
      }
      const currentGroup = currentItemTab.groups[currentItem.playGroup.id];
      currentGroup.matches.push(currentItem);
      currentGroup.isComplete = currentGroup.isComplete && this.isMatchComplete(currentItem);

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

  /**
   * Gives each group its standings, the players of each side taken from the group's matches. Rows of a side
   * without a match in the group are left out.
   */
  withStandings(groups: DisciplineGroup[], standings: GroupStandings[]): DisciplineGroup[] {
    return groups.map((group) => {
      const rows = standings.find((s) => s.groupId === group.id)?.rows ?? [];
      const players = this.playersBySide(group.matches);
      const lines: StandingLine[] = rows
        .filter((row) => players.has(row.sideId))
        .map((row) => ({ ...row, players: players.get(row.sideId) }));
      return { ...group, standings: lines };
    });
  }

  private playersBySide(matches: Match[]): Map<number, Player[]> {
    const players = new Map<number, Player[]>();
    for (const match of matches) {
      if (match.side1Id != null && match.team1?.length) players.set(match.side1Id, match.team1);
      if (match.side2Id != null && match.team2?.length) players.set(match.side2Id, match.team2);
    }
    return players;
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
