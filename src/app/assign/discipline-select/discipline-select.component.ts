import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Discipline} from '../../shared/data/discipline.model';
import {DisciplineService} from '../discipline.service';

@Component({
    selector: 'toma-discipline-select',
    templateUrl: './discipline-select.component.html',
    styleUrls: ['./discipline-select.component.scss']
})
export class DisciplineSelectComponent implements OnInit {

    selectedDiscipline: number;
    disciplines: Discipline[];

    @Input() showWaitingList: boolean;

    @Output() disciplineChanged = new EventEmitter<number>();

    constructor(private disciplineService: DisciplineService) {
    }

    ngOnInit(): void {
        this.disciplineService.loadOpenDisciplines().subscribe(this.disciplinesLoaded.bind(this));
    }

    disciplinesLoaded(disciplines: Discipline[]) {
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
        this.disciplines = result.concat(disciplines);
        this.selectedDiscipline = this.disciplines[0].id;
    }


}
