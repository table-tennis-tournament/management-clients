import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Table} from './table.model';

@Component({
    selector: 'app-tt-table',
    templateUrl: './tt-table.component.html',
    styleUrls: ['./tt-table.component.scss']
})
export class TtTableComponent {

    @Input()
    table: Table;

    @Output()
    updateMatchResult = new EventEmitter();

}
