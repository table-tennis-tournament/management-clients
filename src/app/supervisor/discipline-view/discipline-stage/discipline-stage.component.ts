import {Component, Input} from '@angular/core';
import {DisciplineStage} from '../models/discipline.stage.model';

@Component({
    selector: 'toma-discipline-stage',
    templateUrl: './discipline-stage.component.html',
    styleUrls: ['./discipline-stage.component.scss']
})
export class DisciplineStageComponent {

    lineStageClass: string[] = [
        'first-stage',
        'second-stage',
        'third-stage',
        'fourth-stage',
    ];

    constructor() {
    }

    @Input()
    typeColor: string[];

    @Input()
    stage: DisciplineStage;

    @Input() index: number;

    onDelete() {

    }

    onResultClicked() {

    }

    onClose() {
        console.log('on close');
    }

    onOpen() {
        console.log('on open');
    }

}
