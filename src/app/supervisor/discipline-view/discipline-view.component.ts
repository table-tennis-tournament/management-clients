import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {DisciplineTabService} from './discipline-tab.service';
import {DisciplineTab} from './models/discipline.tab.model';
import {Discipline} from '../../discipline/discipline.model';
import {DisciplineStage} from './models/discipline.stage.model';

@Component({
    selector: 'toma-discipline-view',
    templateUrl: './discipline-view.component.html',
    styleUrls: ['./discipline-view.component.scss']
})
export class DisciplineViewComponent {

    private currentTabId: number;
    tabs: DisciplineTab[];

    selectedTab: DisciplineTab;
    removePlayed = false;
    playersAreOpen = true;

    matchesAreOpen = true;

    @Input()
    matches: Match[];

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
            this.setTabForId(this.tabs[0].id);
        }
    }


    @Input()
    matchesLoading: boolean;

    @Output()
    resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

    constructor(private disciplineTabService: DisciplineTabService) {
    }


    setTabForId(id: number) {
        this.currentTabId = id;
        const createdTab = this.disciplineTabService.getTabForMatches(this.matches.filter(match => match.type.id === id));
        this.selectedTab = createdTab;
        this.removePlayedItems();
    }

    removePlayedItems() {
        if (this.removePlayed === false) {
            const stagesCopy = this.selectedTab.stages.filter(x => x.isComplete === false);
            this.selectedTab.stages = stagesCopy;
            const groupsCopy = this.selectedTab.groups.filter(y => y.isComplete === false);
            this.selectedTab.groups = groupsCopy;
        }
    }

    onRemovePlayedChanged() {
        if (this.removePlayed !== false) {
            this.setTabForId(this.currentTabId);
            return;
        }
        this.removePlayedItems();
    }

    onDeleteStage(stageToRemove: DisciplineStage) {
        this.selectedTab.stages = this.selectedTab.stages.filter(stage => stage !== stageToRemove);
    }

    onOpenPlayers() {

    }

    onOpenMatches() {

    }
}
