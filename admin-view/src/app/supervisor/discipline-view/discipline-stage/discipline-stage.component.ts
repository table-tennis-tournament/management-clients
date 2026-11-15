import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DisciplineStage } from '../models/discipline.stage.model';
import { Match } from '../../../shared/data/match.model';
import { TypeColorMap } from '../../../settings/settings.model';
import { isInProgress, isOpen } from '../../../shared/match-state/match-state';

@Component({
  selector: 'toma-discipline-stage',
  templateUrl: './discipline-stage.component.html',
  styleUrls: ['./discipline-stage.component.scss'],
  standalone: false,
})
export class DisciplineStageComponent {
  lineStageClass: string[] = ['first-stage', 'second-stage', 'third-stage', 'fourth-stage'];

  constructor() {}

  @Input()
  typeColors: TypeColorMap;

  @Input()
  stage: DisciplineStage;

  @Input() index: number;

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  deleteStage: EventEmitter<DisciplineStage> = new EventEmitter<DisciplineStage>();

  readonly isInProgress = isInProgress;
  readonly isOpen = isOpen;
}
