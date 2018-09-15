import {Component, Input, OnInit} from '@angular/core';
import {Match} from '../../../../matchview/match.model';

@Component({
    selector: 'toma-tt-table-match-item',
    templateUrl: './tt-table-match-item.component.html'
})
export class TtTableMatchItemComponent implements OnInit {

    @Input()
    matches: Match[];

    constructor() {
    }

    ngOnInit() {
    }


}
