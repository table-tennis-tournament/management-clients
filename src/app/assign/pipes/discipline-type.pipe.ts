import {Pipe, PipeTransform} from '@angular/core';
import {StageType} from '../../shared/data/stagetype.model';

@Pipe({
    name: 'disciplineType'
})
export class DisciplineTypePipe implements PipeTransform {

    private typeMap = {
        'Finale': 'FI',
        'Halbfinale': 'HF',
        'Viertelfinale': 'VF',
        'Achtelfinale': 'AF',
        'Runde 3': 'RD3',
        'Runde 2': 'RD2',
        'Runde 1': 'RD1'
    };

    transform(value: StageType, args?: any): any {
        return this.typeMap[value.id];
    }

}
