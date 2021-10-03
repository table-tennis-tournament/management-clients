import {Pipe, PipeTransform} from '@angular/core';
import {TTResult} from '../../table/table-list/result-modal/ttresult.model';

@Pipe({
    name: 'resultPipe'
})
export class ResultPipe implements PipeTransform {

    FIRST_PLAYER_SETS = 1;
    SECOND_PLAYER_SETS = 2;

    transform(value: TTResult[], setsForPlayer?: number): any {
        if (value == null || value.length < 1) {
            return '';
        }
        let firstPlayerSets = 0;
        let secondPlayerSets = 0;
        value.forEach((element) => {
            if (element[0] > element[1]) {
                firstPlayerSets++;
                return;
            }
            secondPlayerSets++;
        });
        if (setsForPlayer === this.FIRST_PLAYER_SETS) {
            return firstPlayerSets;
        }
        if (setsForPlayer === this.SECOND_PLAYER_SETS) {
            return secondPlayerSets;
        }
        return firstPlayerSets + ' : ' + secondPlayerSets;
    }
}
