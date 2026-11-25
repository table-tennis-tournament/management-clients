import { Pipe, PipeTransform } from '@angular/core';

import { Match } from '../../shared/data/match.model';

@Pipe({ name: 'discipline' })
export class DisciplinePipe implements PipeTransform {
  transform(value: Match): any {
    if (value.type) {
      return value.type.name;
    }
    return '';
  }
}
