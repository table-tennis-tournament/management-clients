import {Pipe, PipeTransform} from '@angular/core';
import {TTResult} from '../../table/table-list/result-modal/ttresult.model';

@Pipe({
    name: 'resultPipe'
})
export class ResultPipe implements PipeTransform {

    transform(value: TTResult[]): any {
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

        return firstPlayerSets + ' : ' + secondPlayerSets;
    }
}
