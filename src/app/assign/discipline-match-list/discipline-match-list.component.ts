import {Component, Input} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {MatchList} from '../../supervisor/matchlist.model';
import {Discipline} from '../../discipline/discipline.model';

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

    @Input()
    matchList: MatchList[];

    @Input()
    disciplines: Discipline[];

    @Input()
    typeColor: string[];

    currentMatchesToShow: Match[];

    onDisciplineSelected(disciplineId: number) {
        if (+disciplineId === 0) {
            this.currentMatchesToShow = Object.assign([], this.matches);
            return;
        }

        if (+disciplineId === -1) {
            this.currentMatchesToShow = [].concat.apply([], this.matchList.map(item => item.matchinfo));
            return;
        }
        const filteredMatches = this.matches
            .filter(x => x.type.id === +disciplineId)
            .filter(match => !match.isPlayed);
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
        return currentMatch != null &&
            currentMatch.group != null &&
            currentMatch.group.id === groupId;
    }

}
