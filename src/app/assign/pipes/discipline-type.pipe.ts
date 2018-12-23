import {Pipe, PipeTransform} from '@angular/core';
import {StageType} from '../../shared/data/stagetype.model';
import {DisciplineShortcuts} from './disciplineShortcuts';

@Pipe({
    name: 'disciplineType'
})
export class DisciplineTypePipe implements PipeTransform {

    transform(value: StageType, args?: any): any {
        const disciplineMap = [];
        disciplineMap['Finale'] = 'FI';
        disciplineMap['Halbfinale'] = 'HF';
        disciplineMap['Viertelfinale'] = 'VF';
        disciplineMap['Achtelfinale'] = 'AF';
        disciplineMap['Runde 3'] = 'RD3';
        disciplineMap['Runde 2'] = 'RD2';
        disciplineMap['Runde 1'] = 'RD1';
        return disciplineMap[value.name];
    }

}
