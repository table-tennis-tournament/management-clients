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

    constructor() {
    }

    onDropSuccess(event) {
        console.log(event);
    }

    transferDataSuccess(event){
        let matchInfo = [];
        if(this.isSingleDragItem(event)){
            matchInfo = [event.dragData];
        }
        if(this.isGroupDragItem(event)){
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
