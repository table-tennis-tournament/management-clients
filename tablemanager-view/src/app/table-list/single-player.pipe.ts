import {Pipe, PipeTransform} from '@angular/core';
import {Player} from './match/player.model';

@Pipe({
    name: 'singlePlayer'
})
export class SinglePlayerPipe implements PipeTransform {

    transform(value: Player, ...args: any[]): any {
        return value.first_name + ' ' + value.last_name;
    }
}
