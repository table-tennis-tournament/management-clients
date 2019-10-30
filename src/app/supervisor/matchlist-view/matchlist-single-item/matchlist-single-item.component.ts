import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatchList} from '../../matchlist.model';

@Component({
  selector: 'toma-matchlist-single-item',
  templateUrl: './matchlist-single-item.component.html',
  styleUrls: ['./matchlist-single-item.component.scss']
})
export class MatchlistSingleItemComponent {

  @Input()
  matchListItem: MatchList;

  @Output()
  matchListItemDelete = new EventEmitter<MatchList>();

  constructor() { }

}
