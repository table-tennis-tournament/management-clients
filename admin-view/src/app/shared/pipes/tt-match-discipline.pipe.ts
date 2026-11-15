import { Pipe, PipeTransform } from '@angular/core';

import { Match } from '../data/match.model';

@Pipe({ name: 'ttMatchDiscipline' })
export class TtMatchDisciplinePipe implements PipeTransform {
  transform(match: Match): any {
    return match.type.name + ' ' + match.matchType.name;
  }
}
