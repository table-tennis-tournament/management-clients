import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Discipline } from '../discipline.model';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'toma-discipline-select',
  templateUrl: './discipline-select.component.html',
  styleUrls: ['./discipline-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatFormField, MatLabel, MatSelect, MatOption, MatMiniFabButton, MatIcon],
})
export class DisciplineSelectComponent {
  selectedDiscipline: number;
  openDisciplines: Discipline[];

  _disciplines: Discipline[];
  private _showWaitingList: boolean;

  get disciplines(): Discipline[] {
    return this._disciplines;
  }

  @Input()
  set disciplines(value: Discipline[]) {
    this._disciplines = value;
    this.refreshSelectBox();
  }

  @Input()
  set showWaitingList(value: boolean) {
    this._showWaitingList = value;
    this.refreshSelectBox();
  }

  get showWaitingList() {
    return this._showWaitingList;
  }

  @Input()
  showAll = false;

  @Output()
  disciplineChanged = new EventEmitter<number>();

  @Output()
  disciplineRefresh = new EventEmitter<number>();

  constructor() {}

  private refreshSelectBox() {
    let disciplines = this._disciplines;
    if (!this.showAll && disciplines) {
      disciplines = this.disciplines.filter((discipline) => discipline.active);
    }
    const result = [];
    if (this.showWaitingList) {
      result.push({
        id: -1,
        name: 'Warteschlange',
      });
    }
    result.push({
      id: 0,
      name: 'Alle',
    });
    this.openDisciplines = result.concat(disciplines);
    this.selectedDiscipline = this.openDisciplines[0].id;
    this.disciplineChanged.emit(this.selectedDiscipline);
  }
}
