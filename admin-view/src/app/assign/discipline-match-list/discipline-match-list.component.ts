import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { MatchList } from '../../supervisor/matchlist.model';
import { Discipline } from '../../discipline/discipline.model';
import { MatchState } from '../../shared/data/matchstate.model';

@Component({
  selector: 'toma-discipline-match-list',
  templateUrl: './discipline-match-list.component.html',
  styleUrls: ['./discipline-match-list.component.scss'],
})
export class DisciplineMatchListComponent {
  private _matches: Match[];
  currentDisciplineId: number;
  private _matchList: MatchList[];

  @Input()
  set matches(value: Match[]) {
    this._matches = value;
    if (this.currentDisciplineId == null) {
      return;
    }
    this.onDisciplineSelected(this.currentDisciplineId);
  }

  get matches() {
    return this._matches;
  }

  @Input()
  matchesLoading: boolean;

  @Input()
  set matchList(value: MatchList[]) {
    this._matchList = value;
    if (this.currentDisciplineId == null) {
      return;
    }
    this.onDisciplineSelected(this.currentDisciplineId);
  }

  get matchList() {
    return this._matchList;
  }

  @Input()
  disciplines: Discipline[];

  @Input()
  typeColor: string[];

  @Output()
  disciplineRefresh = new EventEmitter<number>();

  currentMatchesToShow: Match[];

  onDisciplineSelected(disciplineId: number) {
    this.currentDisciplineId = disciplineId;
    if (+disciplineId === 0) {
      this.currentMatchesToShow = Object.assign(
        [],
        this.matches.filter((match) => this.isMatchOpenOrInWaitingList(match))
      );
      return;
    }

    if (+disciplineId === -1) {
      this.currentMatchesToShow = [].concat.apply(
        [],
        this.matchList.map((item) => item.matchinfo)
      );
      return;
    }
    const filteredMatches = this.matches
      .filter((match) => match.type.id === +disciplineId)
      .filter((match) => this.isMatchOpenOrInWaitingList(match));
    this.currentMatchesToShow = filteredMatches;
  }

  private isMatchOpenOrInWaitingList(match) {
    return match.state === MatchState[MatchState.Open] || match.state === MatchState[MatchState.InWaitingList];
  }

  isMatchInGroup(groupId: number, currentMatch: Match) {
    return (
      currentMatch != null &&
      currentMatch.group != null &&
      currentMatch.group.id === groupId &&
      this.isMatchOpenOrInWaitingList(currentMatch)
    );
  }

  getMatch(groupId: number) {
    return this.matches.filter((x) => this.isMatchInGroup(groupId, x));
  }

  anyMatchIsNotPlayable(currentMatch: MatchList) {
    return currentMatch.matchinfo.filter((match) => !match.isPlayable).length > 0;
  }

  firstMatch(currentMatch: MatchList) {
    return currentMatch.matchinfo[0];
  }
}
