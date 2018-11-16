import {Pipe, PipeTransform} from '@angular/core';
import {StageType} from '../../shared/data/stagetype.model';
import {DisciplineShortcuts} from './disciplineShortcuts';

@Pipe({
    name: 'disciplineType'
})
export class DisciplineTypePipe implements PipeTransform {

    transform(value: StageType, args?: any): any {
        return DisciplineShortcuts.TYPE[value.id];
    }

}
