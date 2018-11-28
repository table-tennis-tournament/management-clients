import {Component, Input} from '@angular/core';
import {Player} from '../data/player.model';

@Component({
    selector: 'toma-team-item',
    templateUrl: './team-item.component.html',
    styleUrls: ['./team-item.component.scss']
})
export class TeamItemComponent {

    @Input() team: Player[];

    @Input() showDisciplines: boolean;

    @Input() showClubs = false;

    @Input() typeColor: string[];

}
