import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'playerresult'
})
export class PlayerresultPipe implements PipeTransform {

    transform(value: any, firstPlayer: boolean): any {
        if (value == null || value.length < 1) {
            return '';
        }
        let firstPlayerSets = 0;
        let secondPlayerSets = 0;
        value.forEach((element) => {
            if (element[0] > element[1]) {
                firstPlayerSets++;
            } else {
                secondPlayerSets++;
            }
        });
        if (firstPlayer) {
            return firstPlayerSets;
        }
        return secondPlayerSets;
    }

}
