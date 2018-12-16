import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Discipline} from '../../discipline/discipline.model';

@Component({
    selector: 'toma-discipline-select',
    templateUrl: './discipline-select.component.html',
    styleUrls: ['./discipline-select.component.scss']
})
export class DisciplineSelectComponent {

    selectedDiscipline: number;
    openDisciplines: Discipline[];

    _disciplines: Discipline[];
    private _showWaitingList: boolean;

    get disciplines(): Discipline[] {
        return this._disciplines;
    }

    @Input('disciplines')
    set disciplines(value: Discipline[]) {
        this._disciplines = value;
        this.refreshSelectBox();
    }

    private refreshSelectBox() {
        const disciplines = this.disciplines.filter(discipline => discipline.active);
        const result = [];
        if (this.showWaitingList) {
            result.push({
                id: -1,
                name: 'Warteschlange'
            });
        }
        result.push({
            id: 0,
            name: 'Alle'
        });
        this.openDisciplines = result.concat(disciplines);
        this.selectedDiscipline = this.openDisciplines[0].id;
        this.disciplineChanged.emit(this.selectedDiscipline);
    }

    @Input('showWaitingList')
    set showWaitingList(value: boolean) {
        this._showWaitingList = value;
        this.refreshSelectBox();
    }

    get showWaitingList() {
        return this._showWaitingList;
    }

    @Output()
    disciplineChanged = new EventEmitter<number>();

    constructor() {
    }

}
