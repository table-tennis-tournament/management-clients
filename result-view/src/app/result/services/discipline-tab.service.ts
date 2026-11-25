import { Injectable } from '@angular/core';
import { DisciplineGroup } from '../data/discipline.group';
import { DisciplineStage } from '../data/discipline.stage';
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

  public getTabForMatches(matches: Match[] | null): DisciplineTab {
    const currentItemTab: DisciplineTab = {
      groups: [],
      stages: [],
    };
    if (matches == null || matches.length < 1) {
      return currentItemTab;
    }
    // the knockout stages in the order they first appear, by name
    const stagesByName = new Map<string, DisciplineStage>();
    for (const match of matches) {
      if (!match.playGroup) {
        const name = match.matchType?.name ?? '';
        let currentStage = stagesByName.get(name);
        if (!currentStage) {
          currentStage = { name, isComplete: true, matches: [] };
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
          id: groupId,
          name: 'Gruppe ' + match.playGroup.name,
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

      // per group, so the matches of several groups may come in any order
      for (const player of match.team1.concat(match.team2)) {
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
      const lines: StandingLine[] = rows.flatMap((row) => {
        const sidePlayers = players.get(row.sideId);
        return sidePlayers ? [{ ...row, players: sidePlayers }] : [];
      });
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
