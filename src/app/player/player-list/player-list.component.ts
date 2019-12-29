import {Component, Input} from '@angular/core';
import {Player} from '../player.model';

@Component({
    selector: 'toma-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent {

    @Input()
    players: Player[];

    @Input()
    playersLoading: boolean;

    constructor() {
    }

}
