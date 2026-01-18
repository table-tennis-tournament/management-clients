import { Component, Input, OnInit } from '@angular/core';
import { DisciplineStage } from '../data/discipline.stage';

@Component({
  standalone: false,
  selector: 'app-stage-view',
  templateUrl: './stage-view.component.html',
})
export class StageViewComponent implements OnInit {
  constructor() {}

  @Input() stage: DisciplineStage;

  ngOnInit() {}
}
