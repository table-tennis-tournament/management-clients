import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatchList} from '../matchlist.model';
import {MatchListItem} from '../matchlistitem.model';
import {Match} from '../../shared/data/match.model';
import {MatchState} from '../../shared/data/matchstate.model';

@Component({
    selector: 'toma-matchlist-view',
    templateUrl: './matchlist-view.component.html',
    styleUrls: ['./matchlist-view.component.scss']
})
export class MatchlistViewComponent {

    @Input()
    matchListMatches: MatchList[] = [];

    @Input()
    typeColor: string[];

    @Output()
    matchListItemDelete = new EventEmitter<MatchList>();

    @Output()
    assignMatchListItem = new EventEmitter<MatchListItem>();

    @Output()
    moveMatchListItem = new EventEmitter<MatchListItem>();

    constructor() {
    }

    onDropSuccess(event) {

        if (this.isMatchData(event.item.data)) {
            this.assignMatchesToMatchList(event.item.data, event.currentIndex);
            return;
        }

        const matchListItem = this.matchListMatches[event.previousIndex];
        this.moveMatchListItem.emit(
            {
                id: matchListItem.matchListItem.id,
                position: event.currentIndex
            }
        );

    }

    private isMatchData(data: any): data is Match[] {
        return data && data[0] && data[0].state !== undefined;
    }

    assignMatchesToMatchList(matches: Match[], index: number) {
        const matchListItem = {
            matchIds: matches
                .filter(match => this.isMatchOpen(match))
                .map(match => match.id),
            position: index
        };
        this.assignMatchListItem.emit(matchListItem);
    }

    private isMatchOpen(match: Match) {
        return match.state === MatchState[MatchState.Open];
    }
}
