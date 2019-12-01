import {Component, Input, OnInit} from '@angular/core';
import {DisciplineGroup} from '../data/discipline.group';

@Component({
  selector: 'app-group-view',
  templateUrl: './group-view.component.html'
})
export class GroupViewComponent implements OnInit {

  constructor() { }

  @Input() group: DisciplineGroup;

  ngOnInit() {
  }

}
