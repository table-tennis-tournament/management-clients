import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Match } from '../data/match';
import { DisciplineStage } from '../data/discipline.stage';

@Component({
  standalone: false,
  selector: 'app-stage-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stage-view.component.html',
})
export class StageViewComponent implements OnInit {
  constructor() {}

  @Input() stage: DisciplineStage;

  /** Keeps the rendered matches across reloads. */
  trackById(_index: number, match: Match): number {
    return match.id;
  }

  ngOnInit() {}
}
