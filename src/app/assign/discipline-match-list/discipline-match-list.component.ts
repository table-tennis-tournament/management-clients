import {Component, Input} from '@angular/core';
import {Match} from '../../shared/data/match.model';

@Component({
    selector: 'toma-discipline-match-list',
    templateUrl: './discipline-match-list.component.html',
    styleUrls: ['./discipline-match-list.component.scss']
})
export class DisciplineMatchListComponent {

    @Input()
    matches: Match[];

    @Input()
    matchesLoading: boolean;

    currentMatchesToShow: Match[];

    onDisciplineSelected(disciplineId: number) {
        if (+disciplineId === 0) {
            this.currentMatchesToShow = Object.assign([], this.matches);
            return;
        }
        const filteredMatches = this.matches
            .filter(x => x.type.id === +disciplineId)
            .filter(match => !match.match.isPlayed);
        this.currentMatchesToShow = filteredMatches;
    }

    onDragStart($event) {
        if ($event.dragData.isGroup === true) {
            const groupId = $event.dragData.matches[0].group.id;
            const matches = this.matches.filter(x => this.isMatchInGroup(groupId, x));
            $event.dragData.matches = matches;
        }
    }

    isMatchInGroup(groupId: number, currentMatch: Match) {
        return currentMatch !== null &&
            currentMatch !== undefined &&
            currentMatch.group !== null &&
            currentMatch.group !== undefined &&
            currentMatch.group.id === groupId;
    }

}
