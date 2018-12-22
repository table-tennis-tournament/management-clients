import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatchList} from '../matchlist.model';
import {MatchListItem} from '../matchlistitem.model';

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

// {item: CdkDrag, currentIndex: 1, previousIndex: 2, container: CdkDropList, previousContainer: CdkDropList}
    onDropSuccess(event) {
        const matchListItem = this.matchListMatches[event.previousIndex];
        const newPosition = event.currentIndex;
        this.moveMatchListItem.emit(
            {
                id: matchListItem.matchListItem.id,
                position: newPosition
            }
        );
    }

    transferDataSuccess(event) {
        let matchInfo = [];
        if (this.isSingleDragItem(event)) {
            matchInfo = [event.dragData];
        }
        if (this.isGroupDragItem(event)) {
            matchInfo = event.dragData;
        }

        const matchListItem = {
            matchIds: matchInfo.map(x => x.match.id),
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
}
