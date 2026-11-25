import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { DisciplineStage } from '../models/discipline.stage.model';
import { Match } from '../../../shared/data/match.model';
import { TypeColorMap } from '../../../settings/settings.model';
import { isInProgress, isOpen } from '../../../shared/match-state/match-state';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { DisciplineStageItemComponent } from './discipline-stage-item/discipline-stage-item.component';

@Component({
  selector: 'toma-discipline-stage',
  templateUrl: './discipline-stage.component.html',
  styleUrls: ['./discipline-stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    CdkDropList,
    MatExpansionPanelTitle,
    CdkDrag,
    MatIcon,
    MatIconButton,
    DisciplineStageItemComponent,
  ],
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
