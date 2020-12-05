import {Pipe, PipeTransform} from '@angular/core';
import {Player} from '../../shared/data/player.model';

@Pipe({
    name: 'ttPlayerNameReducer'
})
export class TtPlayerNameReducerPipe implements PipeTransform {

    transform(players: Player[], args?: any): any {
        if (players === null || players.length === 0) {
            return '';
        }
        if (players.length === 1) {
            return this.getSinglePlayerString(players[0]);
        }
        if (players.length === 2) {
            return this.getSinglePlayerStringShort(players[0]) + '/' +
                this.getSinglePlayerStringShort(players[1]);
        }
        return '';
    }

    getSinglePlayerString(player: Player) {
        return player.firstName + ' ' + player.lastName + '(' + player.club.clubName + ')';
    }

    getSinglePlayerStringShort(player: Player) {
        return player.firstName.substr(0, 2) + '. ' + player.lastName;
    }

}
