import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { DisciplineGroup } from '../models/discipline.group.model';
import { Match } from '../../../shared/data/match.model';
import { TypeColorMap } from '../../../settings/settings.model';
import { isOpen, isOver, isQueued } from '../../../shared/match-state/match-state';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { TypeColorDirective } from '../../../shared/directives/type-color.directive';
import { MatList, MatListItem } from '@angular/material/list';
import { TeamItemComponent } from '../../../shared/team-item/team-item.component';
import { ResultPipe } from '../../../shared/pipes/result.pipe';

@Component({
  selector: 'toma-discipline-group',
  templateUrl: './discipline-group.component.html',
  styleUrls: ['./discipline-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardTitle,
    CdkDropList,
    CdkDrag,
    MatIcon,
    MatCardContent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    TypeColorDirective,
    MatExpansionPanelTitle,
    MatList,
    MatListItem,
    TeamItemComponent,
    ResultPipe,
  ],
})
export class DisciplineGroupComponent {
  readonly isOpen = isOpen;
  readonly isQueued = isQueued;
  tableNumbers: any[] = [];

  @Input()
  typeColors: TypeColorMap = {};

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Input()
  stopRefresh: boolean = false;

  _showPlayers = false;
  _showMatches = false;

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
    return this.group.matches.filter((match) => !isOver(match)).length;
  }

  @Input()
  set showPlayers(value: boolean) {
    this._showPlayers = value;
    // this.openCloseByIndex(value, 0);
  }

  get showPlayers(): boolean {
    return this._showPlayers;
  }

  _group!: DisciplineGroup;
  get group(): DisciplineGroup {
    return this._group;
  }

  @Input({ required: true })
  set group(value: DisciplineGroup) {
    this._group = value;
    this.setTables();
  }

  setTables() {
    const numberArray: number[] = [];
    this.group.matches.forEach((element) => {
      if (element.tableNumber && numberArray.indexOf(element.tableNumber) < 0) {
        numberArray.push(element.tableNumber);
      }
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
    return this.group.matches.every(isQueued);
  }

  groupIsNotPlayable() {
    return !this.group.isComplete && !this.isGroupPlayable() && this.tableNumbers.length < 1;
  }

  groupIsNotComplete() {
    return this.group.matches.some((match) => !isOver(match));
  }

  groupIsDraggable() {
    return this.group.matches.some(isOpen);
  }
}
