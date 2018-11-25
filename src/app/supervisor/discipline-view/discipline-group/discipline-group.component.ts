import {Component, Input} from '@angular/core';
import {DisciplineGroup} from '../models/discipline.group.model';

@Component({
    selector: 'toma-discipline-group',
    templateUrl: './discipline-group.component.html',
    styleUrls: ['./discipline-group.component.scss']
})
export class DisciplineGroupComponent {
    openMatches: number;
    isComplete: boolean;
    allMatchCount: number;
    private tableNumbers: any[];

    constructor() {
    }

    _group: DisciplineGroup;
    get group(): DisciplineGroup {
        return this._group;
    }

    @Input('group')
    set group(value: DisciplineGroup) {
        this._group = value;
        this.calculateOpenMatches();
        this.setTables();
    }

    calculateOpenMatches() {
        this.openMatches = 0;
        this.isComplete = true;
        this._group.matches.forEach(element => {
            if (element.match.isPlayed !== true) {
                this.openMatches++;
            }
        });
        this.allMatchCount = this._group.matches.length;
    }

    setTables() {
        const numberArray = [];
        this._group.matches.forEach(element => {
            element.table.forEach(tableNumber => {
                if (numberArray.indexOf(tableNumber) < 0) {
                    numberArray.push(tableNumber);
                }
            });
        });
        this.tableNumbers = numberArray;
    }

}
