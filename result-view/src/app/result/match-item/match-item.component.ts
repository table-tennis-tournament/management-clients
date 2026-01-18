import { Component, Input, OnInit } from '@angular/core';
import { Match } from '../data/match';

@Component({
  standalone: false,
  selector: 'app-match-item',
  templateUrl: './match-item.component.html',
  styleUrls: ['./match-item.component.scss'],
})
export class MatchItemComponent implements OnInit {
  constructor() {}

  @Input() match: Match;

  ngOnInit() {}
}
