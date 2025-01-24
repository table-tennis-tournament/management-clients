import { Pipe, PipeTransform } from '@angular/core';
import { StageType } from '../data/stagetype.model';

@Pipe({
    name: 'disciplineType',
    standalone: false
})
export class DisciplineTypePipe implements PipeTransform {
  transform(value: StageType, args?: any): any {
    const disciplineMap = [];
    disciplineMap['Finale'] = 'FI';
    disciplineMap['Halbfinale'] = 'HF';
    disciplineMap['Viertelfinale'] = 'VF';
    disciplineMap['Achtelfinale'] = 'AF';
    disciplineMap['Runde 3'] = 'R3';
    disciplineMap['Runde 2'] = 'R2';
    disciplineMap['Runde 1'] = 'R1';
    return disciplineMap[value.name];
  }
}
