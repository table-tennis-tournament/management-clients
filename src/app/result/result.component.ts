import {Component, OnInit} from '@angular/core';
import {DisciplineGroup} from './data/discipline.group';
import {DisciplineStage} from './data/discipline.stage';
import {DisciplineTab} from './data/discipline.tab';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  public currentTabs: DisciplineTab[];
  public rowCount: number[];
  public selectedTab: DisciplineTab;
  private lineStageClass: string[] = [
    'first-stage-result',
    'second-stage-result',
    'third-stage-result'
  ];
  public colors: string[];
  private changeTime = 15000;
  private currentIndex = 0;
  public isFixed = false;

  constructor() {
  }

  ngOnInit() {
    this.currentTabs = [
      new DisciplineTab(1, 'Herren A', 1),
      new DisciplineTab(2, 'Herren B', 1)
    ];
    this.selectedTab = this.currentTabs[0];
  }

  onTabSelected(selectedTab: DisciplineTab) {
    this.currentIndex = this.currentTabs.indexOf(selectedTab);
  }

  onIsFixedChanged() {
    this.startTimer();
  }

  private startTimer() {

  }
}
