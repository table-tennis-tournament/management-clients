import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Player } from '../../shared/data/player.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'toma-referees-list',
  templateUrl: './referees-list.component.html',
  styleUrls: ['./referees-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatProgressSpinner, MatList, MatListItem],
})
export class RefereesListComponent {
  @Input()
  referees: Player[];

  @Input()
  refereesLoading: boolean;

  constructor() {}
}
