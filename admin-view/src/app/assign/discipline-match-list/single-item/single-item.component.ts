import { Component, Input, OnInit } from '@angular/core';
import { Match } from '../../../shared/data/match.model';
import { TypeColorMap } from '../../../settings/settings.model';

@Component({
  selector: 'toma-single-item',
  templateUrl: './single-item.component.html',
  styleUrls: ['./single-item.component.scss'],
  standalone: false,
})
export class SingleItemComponent {
  constructor() {}

  @Input()
  typeColors: TypeColorMap;

  @Input()
  currentMatch: Match;
}
