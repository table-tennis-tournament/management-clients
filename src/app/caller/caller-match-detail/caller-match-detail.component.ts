import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatchAggregate} from '../../shared/data/match.aggregate';

@Component({
    selector: 'toma-caller-match-detail',
    templateUrl: './caller-match-detail.component.html',
    styleUrls: ['./caller-match-detail.component.scss']
})
export class CallerMatchDetailComponent {

    @Input()
    typeColor: string[];

    @Input()
    matchAggregate: MatchAggregate;

    @Output()
    matchCalled: EventEmitter<number[]> = new EventEmitter();

    onMatchCalled() {
        this.matchCalled.emit(this.matchAggregate.matches.map(match => match.id));
    }

}
