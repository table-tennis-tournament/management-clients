import {Component, Input} from '@angular/core';
import {Match} from '../../../../shared/data/match.model';

@Component({
    selector: 'toma-discipline-stage-item',
    templateUrl: './discipline-stage-item.component.html',
    styleUrls: ['./discipline-stage-item.component.scss']
})
export class DisciplineStageItemComponent {

    @Input()
    match: Match;

}
