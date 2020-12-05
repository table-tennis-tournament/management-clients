import {Pipe, PipeTransform} from '@angular/core';
import {Match} from '../../shared/data/match.model';

@Pipe({
    name: 'stage'
})
export class StagePipe implements PipeTransform {

    transform(value: Match, args?: any): any {
        if (value.matchType) {
            return value.matchType.name;
        }
        return value.group.name;
    }

}
