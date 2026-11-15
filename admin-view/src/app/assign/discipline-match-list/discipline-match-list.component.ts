import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { MatchList } from '../../supervisor/matchlist.model';
import { Discipline } from '../../discipline/discipline.model';
import { TypeColorMap } from '../../settings/settings.model';
import { isWaiting } from '../../shared/match-state/match-state';

@Component({
  selector: 'toma-discipline-match-list',
  templateUrl: './discipline-match-list.component.html',
  styleUrls: ['./discipline-match-list.component.scss'],
  standalone: false,
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
  typeColors: TypeColorMap;

  @Output()
  disciplineRefresh = new EventEmitter<number>();

  currentMatchesToShow: Match[];

  onDisciplineSelected(disciplineId: number) {
    this.currentDisciplineId = disciplineId;
    if (+disciplineId === 0) {
      this.currentMatchesToShow = Object.assign([], this.matches.filter(isWaiting));
      return;
    }

    if (+disciplineId === -1) {
      this.currentMatchesToShow = [].concat.apply(
        [],
        this.matchList.map((item) => item.matchinfo)
      );
      return;
    }
    const filteredMatches = this.matches.filter((match) => match.type.id === +disciplineId).filter(isWaiting);
    this.currentMatchesToShow = filteredMatches;
  }

  isMatchInGroup(groupId: number, currentMatch: Match) {
    return (
      currentMatch != null &&
      currentMatch.playGroup != null &&
      currentMatch.playGroup.id === groupId &&
      isWaiting(currentMatch)
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
