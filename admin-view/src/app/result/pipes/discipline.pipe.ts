import { Pipe, PipeTransform } from '@angular/core';
import { Match } from '../../shared/data/match.model';

@Pipe({
  name: 'discipline',
  standalone: false,
})
export class DisciplinePipe implements PipeTransform {
  transform(value: Match, args?: any): any {
    if (value.type) {
      return value.type.name;
    }
    return '';
  }
}
