import { Component, Input, OnInit } from '@angular/core';
import { DisciplineStage } from '../data/discipline.stage';

@Component({
  selector: 'app-bracket-view',
  standalone: false,
  templateUrl: './bracket-view.component.html',
  styleUrls: ['./bracket-view.component.scss'],
})
export class BracketViewComponent implements OnInit {
  @Input() stages: DisciplineStage[];

  constructor() {}

  ngOnInit() {}
}
