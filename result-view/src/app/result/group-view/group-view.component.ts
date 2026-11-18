import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Match } from '../data/match';
import { DisciplineGroup } from '../data/discipline.group';

@Component({
  standalone: false,
  selector: 'app-group-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-view.component.html',
})
export class GroupViewComponent implements OnInit {
  constructor() {}

  @Input() group: DisciplineGroup;

  /** Keeps the rendered matches across reloads. */
  trackById(_index: number, match: Match): number {
    return match.id;
  }

  ngOnInit() {}
}
