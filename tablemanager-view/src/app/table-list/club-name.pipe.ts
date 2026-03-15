import { Pipe, PipeTransform } from '@angular/core';
import {Player} from './match/player.model';

@Pipe({ name: 'clubName' })
export class ClubNamePipe implements PipeTransform {

  transform(value: Player[]): string | undefined {
    if (value && value.length === 1) {
      return value[0].club ;
    }
    if (value && value.length === 2) {
      return value[0].club + '/' + value[1].club;
    }
    return undefined;
  }

}
