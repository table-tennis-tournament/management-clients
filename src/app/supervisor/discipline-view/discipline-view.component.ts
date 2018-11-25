import {Component, Input, OnInit} from '@angular/core';
import {Match} from '../../shared/data/match.model';

@Component({
    selector: 'toma-discipline-view',
    templateUrl: './discipline-view.component.html',
    styleUrls: ['./discipline-view.component.scss']
})
export class DisciplineViewComponent implements OnInit {

    @Input()
    matches: Match[];

    constructor() {
    }

    ngOnInit() {
    }

}
