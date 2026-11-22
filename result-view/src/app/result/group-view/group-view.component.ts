import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Match } from '../data/match';
import { DisciplineGroup } from '../data/discipline.group';
import { StandingLine } from '../data/standing';

@Component({
  standalone: false,
  selector: 'app-group-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.scss'],
})
export class GroupViewComponent implements OnInit {
  constructor() {}

  @Input() group: DisciplineGroup;

  /** Keeps the rendered matches across reloads. */
  trackById(_index: number, match: Match): number {
    return match.id;
  }

  /** Keeps the rendered standings rows across reloads. */
  trackBySide(_index: number, line: StandingLine): number {
    return line.sideId;
  }

  ngOnInit() {}
}
