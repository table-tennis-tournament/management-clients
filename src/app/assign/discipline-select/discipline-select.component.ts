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

    get disciplines(): Discipline[] {
        return this._disciplines;
    }

    @Input('disciplines')
    set disciplines(value: Discipline[]) {
        this._disciplines = value;
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
    }

    @Input() showWaitingList: boolean;

    @Output() disciplineChanged = new EventEmitter<number>();

    constructor() {
    }

}
