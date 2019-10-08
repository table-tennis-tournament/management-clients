import { Pipe, PipeTransform } from '@angular/core';
import {Player} from './player.model';

@Pipe({
  name: 'playerName'
})
export class PlayerNamePipe implements PipeTransform {

  transform(value: Player, ...args: any[]): any {
    return value.firstName + ' ' + value.lastName;
  }

}
