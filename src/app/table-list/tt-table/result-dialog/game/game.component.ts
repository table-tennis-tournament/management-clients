import {Component, Input} from '@angular/core';
import {Game} from '../../../match/game.model';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss']
})
export class GameComponent {

    _game: Game;

    @Input('game')
    set game(value: Game) {
        this._game = value;
        if (this._game) {
            this.scorePlayerA = String(this.game.player_ascore);
            this.scorePlayerB = String(this.game.player_bscore);
        }
    }

    get game(): Game {
        return this._game;
    }

    scorePlayerA: string;
    scorePlayerB: string;

    constructor() {
    }

}
