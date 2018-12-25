import {Component, Input} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {MatchList} from '../../supervisor/matchlist.model';
import {Discipline} from '../../discipline/discipline.model';
import {MatchState} from '../../shared/data/matchstate.model';

@Component({
    selector: 'toma-discipline-match-list',
    templateUrl: './discipline-match-list.component.html',
    styleUrls: ['./discipline-match-list.component.scss']
})
export class DisciplineMatchListComponent {

    private _matches: Match[];
    private currentDisciplineId: number;
    private _matchList: MatchList[];

    @Input()
    set matches(value: Match[]) {
        this._matches = value;
        if (this.currentDisciplineId == null) {
            return;
        }
        this.onDisciplineSelected(this.currentDisciplineId == null ? 0 : this.currentDisciplineId);
    }

    get matches() {
        return this._matches;
    }

    @Input()
    matchesLoading: boolean;


    @Input()
    set matchList(value: MatchList[]) {
        this._matchList = value;
        if (this.currentDisciplineId == null) {
            return;
        }
        this.onDisciplineSelected(this.currentDisciplineId == null ? 0 : this.currentDisciplineId);
    }

    get matchList() {
        return this._matchList;
    }

    @Input()
    disciplines: Discipline[];

    @Input()
    typeColor: string[];

    currentMatchesToShow: Match[];

    onDisciplineSelected(disciplineId: number) {
        this.currentDisciplineId = disciplineId;
        if (+disciplineId === 0) {
            this.currentMatchesToShow = Object.assign([], this.matches
                .filter(match => this.isMatchOpenOrInWaitingList(match)));
            return;
        }

        if (+disciplineId === -1) {
            this.currentMatchesToShow = [].concat.apply([], this.matchList.map(item => item.matchinfo));
            return;
        }
        const filteredMatches = this.matches
            .filter(match => match.type.id === +disciplineId)
            .filter(match => this.isMatchOpenOrInWaitingList(match));
        this.currentMatchesToShow = filteredMatches;
    }

    private isMatchOpenOrInWaitingList(match) {
        return match.state === MatchState[MatchState.Open]
            || match.state === MatchState[MatchState.InWaitingList];
    }



    onDragStart($event) {
        if ($event.dragData.isGroup === true) {
            const groupId = $event.dragData.matches[0].group.id;
            const matches = this.matches.filter(x => this.isMatchInGroup(groupId, x));
            $event.dragData.matches = matches;
        }
    }

    isMatchInGroup(groupId: number, currentMatch: Match) {
        return currentMatch != null &&
            currentMatch.group != null &&
            currentMatch.group.id === groupId &&
            this.isMatchOpenOrInWaitingList(currentMatch);
    }

}
