import { Component, OnInit, Input } from '@angular/core';
import { Match } from '../../match/match.model';

@Component({
  selector: 'app-matchlist',
  templateUrl: './matchlist.component.html',
  styleUrls: ['./matchlist.component.scss']
})
export class MatchlistComponent implements OnInit {

  @Input()
  matches: Match[];

  constructor() { }

  ngOnInit() {
  }

}
