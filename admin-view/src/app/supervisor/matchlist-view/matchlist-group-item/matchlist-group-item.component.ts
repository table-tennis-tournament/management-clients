import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatchList} from '../../matchlist.model';

@Component({
  selector: 'toma-matchlist-group-item',
  templateUrl: './matchlist-group-item.component.html',
  styleUrls: ['./matchlist-group-item.component.scss']
})
export class MatchlistGroupItemComponent {

  @Input()
  matchListItem: MatchList;

  @Output()
  matchListItemDelete = new EventEmitter<MatchList>();

  constructor() { }

}
