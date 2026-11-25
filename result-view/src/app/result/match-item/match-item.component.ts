import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Match } from '../data/match';

@Component({
  standalone: false,
  selector: 'app-match-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './match-item.component.html',
  styleUrls: ['./match-item.component.scss'],
})
export class MatchItemComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) match!: Match;

  ngOnInit() {}
}
