import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DisciplineGroup } from '../models/discipline.group.model';
import { Match } from '../../../shared/data/match.model';
import { MatchState } from '../../../shared/data/matchstate.model';
import { TypeColorMap } from '../../../settings/settings.model';

@Component({
  selector: 'toma-discipline-group',
  templateUrl: './discipline-group.component.html',
  styleUrls: ['./discipline-group.component.scss'],
  standalone: false,
})
export class DisciplineGroupComponent {
  openMatchState: string = MatchState[MatchState.Open];
  inWaitingListState: string = MatchState[MatchState.InWaitingList];
  tableNumbers: any[];

  @Input()
  typeColors: TypeColorMap;

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Input()
  stopRefresh: boolean;

  _showPlayers: boolean;
  _showMatches: boolean;

  @Input()
  set showMatches(value: boolean) {
    this._showMatches = value;
    // this.openCloseByIndex(value, 1);
  }

  get showMatches(): boolean {
    return this._showMatches;
  }

  get allMatchCount(): number {
    return this.group.matches.length;
  }

  get openMatches() {
    return this.group.matches.filter((match) => match.state !== MatchState[MatchState.Completed]).length;
  }

  @Input()
  set showPlayers(value: boolean) {
    this._showPlayers = value;
    // this.openCloseByIndex(value, 0);
  }

  get showPlayers(): boolean {
    return this._showPlayers;
  }

  _group: DisciplineGroup;
  get group(): DisciplineGroup {
    return this._group;
  }

  @Input()
  set group(value: DisciplineGroup) {
    this._group = value;
    this.setTables();
  }

  setTables() {
    const numberArray = [];
    this.group.matches.forEach((element) => {
      element.table.forEach((tableNumber) => {
        if (numberArray.indexOf(tableNumber) < 0) {
          numberArray.push(tableNumber);
        }
      });
    });
    this.tableNumbers = numberArray;
  }

  // openCloseByIndex(value: boolean, index: number) {
  //     if (value === true) {
  //         this.collapsibleGroup.open(index);
  //         return;
  //     }
  //     this.collapsibleGroup.close(index);
  // }

  isGroupPlayable() {
    const playableMatches = this.group.matches.filter((match) => match.isPlayable === false);
    return playableMatches.length === 0;
  }

  isGroupInWaitingList() {
    const playableMatches = this.group.matches.filter((match) => match.state === MatchState[MatchState.InWaitingList]);
    return playableMatches.length === this.group.matches.length;
  }

  groupIsNotPlayable() {
    return !this.group.isComplete && !this.isGroupPlayable() && this.tableNumbers.length < 1;
  }

  groupIsNotComplete() {
    const notFinishedMatches = this.group.matches.filter((match) => match.state !== MatchState[MatchState.Completed]);
    return notFinishedMatches.length > 0;
  }

  groupIsDraggable() {
    const openMatches = this.group.matches.filter((match) => match.state === MatchState[MatchState.Open]);
    return openMatches.length > 0;
  }
}
