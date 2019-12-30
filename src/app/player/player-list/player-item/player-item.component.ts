import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../../data/player.model';

@Component({
    selector: 'toma-player-item',
    templateUrl: './player-item.component.html',
    styleUrls: ['./player-item.component.scss']
})
export class PlayerItemComponent implements OnInit {

    @Input()
    player: Player;

    constructor() {
    }

    ngOnInit() {
    }

}
