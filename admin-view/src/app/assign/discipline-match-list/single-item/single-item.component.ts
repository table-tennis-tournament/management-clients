import { Component, Input, OnInit } from '@angular/core';
import { Match } from '../../../shared/data/match.model';

@Component({
    selector: 'toma-single-item',
    templateUrl: './single-item.component.html',
    styleUrls: ['./single-item.component.scss'],
    standalone: false
})
export class SingleItemComponent {
  constructor() {}

  @Input()
  typeColor: string[];

  @Input()
  currentMatch: Match;
}
