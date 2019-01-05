import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {DisciplineTabService} from './discipline-tab.service';
import {DisciplineTab} from './models/discipline.tab.model';
import {Discipline} from '../../discipline/discipline.model';
import {DisciplineStage} from './models/discipline.stage.model';
import {DisciplineGroup} from './models/discipline.group.model';
import * as deepEqual from 'deep-equal';

@Component({
    selector: 'toma-discipline-view',
    templateUrl: './discipline-view.component.html',
    styleUrls: ['./discipline-view.component.scss']
})
export class DisciplineViewComponent {

    currentTabId: number;
    tabs: DisciplineTab[];

    selectedTab: DisciplineTab;

    showAllMatches = false;
    playersAreOpen = true;
    matchesAreOpen = true;
    stopRefresh = false;

    private _matches: Match [];

    @Input()
    set matches(value: Match[]) {
        this._matches = value;
        if (this.stopRefresh) {
            return;
        }
        this.setTabForId(this.currentTabId);
    }

    get matches() {
        return this._matches;
    }

    @Input()
    typeColor: string[];

    _disciplines: Discipline[];

    get disciplines() {
        return this._disciplines;
    }

    @Input('disciplines')
    set disciplines(value: Discipline[]) {
        this._disciplines = value;
        this.tabs = this.disciplineTabService.getTabsForDisciplines(this.disciplines.filter(discipline => discipline.active));
        if (this.tabs && this.tabs.length > 0) {
            const firstTabDisciplineId = this.tabs[0].id;
            this.setTabForId(firstTabDisciplineId);
        }
    }

    @Input()
    matchesLoading: boolean;

    @Output()
    resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

    @Output()
    selectDiscipline: EventEmitter<number> = new EventEmitter<number>();

    constructor(private disciplineTabService: DisciplineTabService) {
    }

    setTabForId(id: number) {
        if (id < 1) {
            return;
        }
        this.currentTabId = id;
        this.mergeMatches(id);
        this.removePlayedItems();
        this.selectDiscipline.emit(this.selectedTab.id);
    }

    private mergeMatches(id: number) {
        const createdTab = this.disciplineTabService.getTabForMatches(this.matches.filter(match => match.type.id === id));
        if (this.isBigChange(createdTab)) {
            this.selectedTab = createdTab;
            return;
        }
        this.mergeStage(this.selectedTab.stages, createdTab.stages);
        this.mergeGroups(this.selectedTab.groups, createdTab.groups);
        // this.selectedTab = createdTab;
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

    private isBigChange(createdTab) {
        return createdTab == null
            || this.selectedTab == null
            || createdTab.id !== this.selectedTab.id
            || this.selectedTab.groups.length !== createdTab.groups.length
            || this.selectedTab.stages.length !== createdTab.stages.length;
    }

    removePlayedItems() {
        if (this.showAllMatches === false) {
            const stagesCopy = this.selectedTab.stages.filter(x => x.isComplete === false);
            this.selectedTab.stages = stagesCopy;
            const groupsCopy = this.selectedTab.groups.filter(y => y.isComplete === false);
            this.selectedTab.groups = groupsCopy;
        }
    }

    onRemovePlayedChanged() {
        if (this.showAllMatches !== false) {
            this.setTabForId(this.currentTabId);
            return;
        }
        this.removePlayedItems();
    }

    onDeleteStage(stageToRemove: DisciplineStage) {
        this.selectedTab.stages = this.selectedTab.stages.filter(stage => stage !== stageToRemove);
    }


}
