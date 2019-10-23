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
        const currentMatch: Match = event.item.data;
        const newPosition = event.currentIndex;

        if(this.matchIsInList(currentMatch)) {
            const matchListItem = this.matchListMatches[event.previousIndex];
            this.moveMatchListItem.emit(
                {
                    id: matchListItem.matchListItem.id,
                    position: newPosition
                }
            );
            return;
        }
        this.transferDataSuccess(currentMatch);

    }

    private matchIsInList(currentMatch: Match) {
        return false;
    }

    transferDataSuccess(currentMatch: Match) {
        const matchInfo = [currentMatch];
        const matchListItem = {
            matchIds: matchInfo
                .filter(match => this.isMatchOpen(match))
                .map(match => match.id),
            position: this.matchListMatches.length
        };
        this.assignMatchListItem.emit(matchListItem);
    }

    private isGroupDragItem(event) {
        return event.dragData[0];
    }

    private isSingleDragItem(event) {
        return event.dragData.team1;
    }

    private isMatchOpen(match: Match) {
        return match.state === MatchState[MatchState.Open];
    }
}
