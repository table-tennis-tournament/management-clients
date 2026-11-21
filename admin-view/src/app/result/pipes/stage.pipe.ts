import { Pipe, PipeTransform } from '@angular/core';

import { Match } from '../../shared/data/match.model';

@Pipe({ name: 'stage' })
export class StagePipe implements PipeTransform {
  transform(value: Match): any {
    if (value.matchType) {
      return value.matchType.name;
    }
    return value.playGroup.name;
  }
}
