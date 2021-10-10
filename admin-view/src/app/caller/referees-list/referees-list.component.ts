import { Component, Input } from '@angular/core';
import { Player } from '../../shared/data/player.model';

@Component({
  selector: 'toma-referees-list',
  templateUrl: './referees-list.component.html',
  styleUrls: ['./referees-list.component.scss'],
})
export class RefereesListComponent {
  @Input()
  referees: Player[];

  @Input()
  refereesLoading: boolean;

  constructor() {}
}
