import {Component, Input, OnInit} from '@angular/core';
import {Table} from '../table.model';

@Component({
  selector: 'app-tt-table',
  templateUrl: './tt-table.component.html',
  styleUrls: ['./tt-table.component.scss']
})
export class TtTableComponent implements OnInit {

  @Input()
  table: Table;

  constructor() { }

  ngOnInit() {
  }

}
