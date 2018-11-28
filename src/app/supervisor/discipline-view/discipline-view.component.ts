import {Component, Input} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {DisciplineTabService} from './discipline-tab.service';
import {DisciplineTab} from './models/discipline.tab.model';
import {Discipline} from '../../discipline/discipline.model';

@Component({
    selector: 'toma-discipline-view',
    templateUrl: './discipline-view.component.html',
    styleUrls: ['./discipline-view.component.scss']
})
export class DisciplineViewComponent {

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

    constructor(private disciplineTabService: DisciplineTabService) {
    }

    // ngAfterContentChecked(): void {
    //     this.tabs = this.disciplineTabService.getTabsForDisciplines(this.disciplines);
    //     if (this.tabs && this.tabs[0] !== null) {
    //         this.setTabForId(this.tabs[0].id);
    //     }
    // }

    setTabForId(id: number) {
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

    onOpenPlayers() {
        // this.randomMatchService.expandPlayer();
    }

    onOpenMatches() {
        // this.randomMatchService.expandMatches();
    }

    onRemovePlayedChanged() {
        if (this.removePlayed !== false) {
            // this.onRefreshCurrentTab();
            return;
        }
        this.removePlayedItems();
    }

    onResultForMatch() {

    }

    onDeleteStage() {

    }
}
