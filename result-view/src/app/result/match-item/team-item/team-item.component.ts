import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../../data/player';

@Component({
  selector: 'app-team-item',
  templateUrl: './team-item.component.html'
})
export class TeamItemComponent implements OnInit {

  @Input() team: Player[];

  constructor() { }

  ngOnInit() {
  }

}
