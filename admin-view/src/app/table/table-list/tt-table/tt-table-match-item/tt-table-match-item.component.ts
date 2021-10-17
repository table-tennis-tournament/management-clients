import { Component, Input, OnInit } from '@angular/core';
import { Match } from '../../../../shared/data/match.model';

@Component({
  selector: 'toma-tt-table-match-item',
  templateUrl: './tt-table-match-item.component.html',
})
export class TtTableMatchItemComponent {
  @Input()
  matches: Match[];
}
