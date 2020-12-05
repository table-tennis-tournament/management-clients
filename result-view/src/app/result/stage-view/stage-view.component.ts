import {Component, Input, OnInit} from '@angular/core';
import {DisciplineStage} from '../data/discipline.stage';

@Component({
  selector: 'app-stage-view',
  templateUrl: './stage-view.component.html'
})
export class StageViewComponent implements OnInit {

  constructor() { }

  @Input() stage: DisciplineStage;

  ngOnInit() {
  }

}
