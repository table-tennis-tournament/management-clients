import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { DisciplineTabService } from './discipline-tab.service';
import { DisciplineTab } from './models/discipline.tab.model';
import { Discipline } from '../../discipline/discipline.model';
import { DisciplineStage } from './models/discipline.stage.model';
import { DisciplineGroup } from './models/discipline.group.model';
import { ShortNameMap, TypeColorMap } from '../../settings/settings.model';
import { DisciplineNamePipe } from '../../shared/pipes/discipline-name.pipe';
import deepEqual from 'deep-equal';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { TypeColorDirective } from '../../shared/directives/type-color.directive';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DisciplineStageComponent } from './discipline-stage/discipline-stage.component';
import { DisciplineGroupComponent } from './discipline-group/discipline-group.component';

/** `id < 1` as JavaScript compares it: true for null, false for undefined. */
function isBelowOne(id: number | null | undefined): boolean {
  return id === null || (id !== undefined && id < 1);
}

@Component({
  selector: 'toma-discipline-view',
  templateUrl: './discipline-view.component.html',
  styleUrls: ['./discipline-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatProgressSpinner,
    MatButton,
    TypeColorDirective,
    MatCheckbox,
    FormsModule,
    DisciplineStageComponent,
    DisciplineGroupComponent,
    DisciplineNamePipe,
  ],
})
export class DisciplineViewComponent {
  private disciplineTabService = inject(DisciplineTabService);

  tabs: DisciplineTab[] = [];
  selectedTab?: DisciplineTab;

  showAllMatches = false;
  playersAreOpen = true;
  matchesAreOpen = true;
  stopRefresh = false;

  private _matches: Match[] = [];
  private _selectedDiscipline: number | null | undefined;

  @Input()
  set matches(value: Match[]) {
    this._matches = value;
    if (this.stopRefresh) {
      return;
    }
    this.setTabForId(this.selectedDiscipline);
  }

  get matches() {
    return this._matches;
  }

  @Input()
  typeColors: TypeColorMap = {};

  @Input()
  shortNames: ShortNameMap = {};

  _disciplines: Discipline[] = [];

  get disciplines() {
    return this._disciplines;
  }

  @Input()
  set disciplines(value: Discipline[]) {
    this._disciplines = value.filter((discipline) => discipline.active);
    this.tabs = this.disciplineTabService.getTabsForDisciplines(this._disciplines);
    const firstId = this.tabs[0]?.id;
    if (isBelowOne(this.selectedDiscipline) && firstId != null) {
      this.selectDiscipline.emit(firstId);
    }
  }

  get selectedDiscipline(): number | null | undefined {
    return this._selectedDiscipline;
  }

  /** Null until the store has a selection. */
  @Input()
  set selectedDiscipline(value: number | null) {
    this._selectedDiscipline = value;
    const firstId = this.disciplines?.[0]?.id;
    if (isBelowOne(value) && firstId != null) {
      this.selectDiscipline.emit(firstId);
      return;
    }
    this.setTabForId(value);
  }

  @Input()
  matchesLoading: boolean = false;

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  selectDiscipline: EventEmitter<number> = new EventEmitter<number>();

  /** Before any selection arrives (undefined), the tab shows the matches without a discipline. */
  setTabForId(id: number | null | undefined) {
    if (isBelowOne(id)) {
      return;
    }
    this.mergeMatches(id);
    this.removePlayedItems();
  }

  private mergeMatches(id: number | null | undefined) {
    // the selection may arrive before the matches
    const matchesOfDiscipline = (this.matches ?? []).filter((match) => match.type?.id === id);
    const createdTab = this.disciplineTabService.getTabForMatches(matchesOfDiscipline);
    const currentTab = this.selectedTab;
    if (!currentTab || this.isBigChange(currentTab, createdTab)) {
      this.selectedTab = createdTab;
      return;
    }
    this.mergeStage(currentTab.stages, createdTab.stages);
    this.mergeGroups(currentTab.groups, createdTab.groups);
  }

  private mergeStage(existingStages: DisciplineStage[], newStages: DisciplineStage[]) {
    for (let index = 0; index < existingStages.length; index++) {
      const existingStage = existingStages[index];
      const newStage = newStages[index];
      if (deepEqual(existingStage, newStage) === false) {
        existingStages[index] = newStage;
      }
    }
  }

  private mergeGroups(existingGroups: DisciplineGroup[], newGroups: DisciplineGroup[]) {
    for (let index = 0; index < existingGroups.length; index++) {
      const existingGroup = existingGroups[index];
      const newGroup = newGroups[index];
      if (deepEqual(existingGroup, newGroup) === false) {
        existingGroups[index] = newGroup;
      }
    }
  }

  private isBigChange(currentTab: DisciplineTab, createdTab: DisciplineTab) {
    return (
      createdTab.id !== currentTab.id ||
      currentTab.groups.length !== createdTab.groups.length ||
      currentTab.stages.length !== createdTab.stages.length
    );
  }

  removePlayedItems() {
    if (this.selectedTab && this.showAllMatches === false) {
      this.selectedTab.stages = this.selectedTab.stages.filter((x) => x.isComplete === false);
      this.selectedTab.groups = this.selectedTab.groups.filter((y) => y.isComplete === false);
    }
  }

  onRemovePlayedChanged() {
    if (this.showAllMatches !== false) {
      this.setTabForId(this.selectedDiscipline);
      return;
    }
    this.removePlayedItems();
  }

  onDeleteStage(stageToRemove: DisciplineStage) {
    if (!this.selectedTab) {
      return;
    }
    this.selectedTab.stages = this.selectedTab.stages.filter((stage) => stage !== stageToRemove);
  }
}
