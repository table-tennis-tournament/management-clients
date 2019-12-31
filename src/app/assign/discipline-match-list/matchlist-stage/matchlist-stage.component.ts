import {Component, Input, OnInit} from '@angular/core';
import {MatchList} from '../../../supervisor/matchlist.model';

@Component({
  selector: 'toma-matchlist-stage',
  templateUrl: './matchlist-stage.component.html',
  styleUrls: ['./matchlist-stage.component.scss']
})
export class MatchlistStageComponent implements OnInit {

  constructor() { }

  @Input()
  matchListItem: MatchList;


  @Input()
  typeColor: string[];

}
