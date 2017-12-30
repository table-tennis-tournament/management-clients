import {Component} from "@angular/core"
import {TypeColors} from "../../data/typeColors"
import {DisciplineShortcuts} from "../../data/disciplineShortcuts"
import { MatchService } from "../../services/match.service";
import { Type } from "../../data/type";
import { DisciplineTab } from "../../data/discipline.tab";
import { MatchDto } from "../../data/match.dto";
import { MatchHelperService } from "../../services/match.helper.service";
import { DisciplineStage } from "../../data/discipline.stage";

@Component({
  selector: "tt-result",
  templateUrl:"assets/javascripts/views/results/main_result.component.html"
})
export class AppResultComponent{
  currentTimer: number;

  public currentTabs: DisciplineTab[];
  public rowCount: number[];
  public selectedTab: DisciplineTab;
  private lineStageClass:string[];
  public colors: string[];
  private changeTime:number = 10000;
  private currentIndex:number = 0;

  constructor(private matchService: MatchService, private matchHelperService: MatchHelperService){
    this.loadTypes();
    new TypeColors();
    this.colors = TypeColors.TYPE_COLORS;
    new DisciplineShortcuts();
    this.initLineStage();
  }

  initLineStage(){
    this.lineStageClass = [];
    this.lineStageClass.push("first-stage-result");
    this.lineStageClass.push("second-stage-result");
    this.lineStageClass.push("third-stage-result");
    this.lineStageClass.push("fourth-stage-result");
    this.lineStageClass.push("fifth-stage-result");
  }

  loadTypes(){
    this.matchService.getAllOpenTypes().subscribe(this.onTypesLoaded.bind(this));
  }

  onTypesLoaded(types: Type[]){
    this.currentTabs = [];
    types.forEach((currentType)=> this.currentTabs.push(new DisciplineTab(currentType.id, currentType.name, currentType.kind)));
    this.rowCount = Array.from(Array(Math.ceil(this.currentTabs.length / 12)).keys());
    if(this.currentTabs.length > 0){
      this.setTabForIndex(this.currentIndex);
    }
    this.startTimer();
  }

  startTimer(){
    clearTimeout(this.currentTimer);
    this.currentTimer = setTimeout(this.refreshOrReloadDiscipline.bind(this), this.changeTime);
  }

  refreshOrReloadDiscipline(){
    if(this.selectedTab.stages.length > 6){
      this.selectedTab.stages.splice(0, 6);
      this.startTimer();
      return;
    }
    if(this.selectedTab.groups.length > 12 && !this.selectedTab.stages[0]){
      this.selectedTab.groups.splice(0, 12);
      this.startTimer();
      return;
    }
    
    this.currentIndex = (this.currentIndex +1) % this.currentTabs.length;
    this.setTabForIndex(this.currentIndex );
    this.startTimer();
  }

  setTabForIndex(index: number){
    this.selectedTab = this.currentTabs[index];
    this.matchService.getMatchesByType(this.selectedTab.id).subscribe(this.handleSetSelectedTab.bind(this), error => console.log(error));
  }

  handleSetSelectedTab(matches: MatchDto[]){
    var newTab = this.matchHelperService.getSingle(matches, this.selectedTab);
    var that = this;
    if(newTab.stages.length < 6){
      this.selectedTab = newTab;
      this.selectedTab.stages.forEach((element, elementIndex) =>{
        element.textColor = that.lineStageClass[elementIndex];
      })
      return;
    }
    if(newTab.stages.length === 6){
      var newStage = this.splitStageInTwo(16, newTab.stages[0]);
      var newStage2 = this.splitStageInTwo(8, newTab.stages[1]);
      var newStage3 = this.splitStageInTwo(4, newTab.stages[2]);

      newTab.stages[6] = newTab.stages[3];
      newTab.stages[7] = newTab.stages[4];
      newTab.stages[8] = newTab.stages[5];
      newTab.stages[5] = newStage;
      newTab.stages[4] = newStage2;
      newTab.stages[3] = newStage3;

      newTab.stages[5].textColor = this.lineStageClass[0];
      newTab.stages[4].textColor = this.lineStageClass[1];
      newTab.stages[3].textColor = this.lineStageClass[2];
      newTab.stages[2].textColor = this.lineStageClass[2];
      newTab.stages[1].textColor = this.lineStageClass[1];
      newTab.stages[0].textColor = this.lineStageClass[0];
      this.selectedTab = newTab;
      return;
    }
    
  }

  splitStageInTwo(count:number, firstGroup:DisciplineStage){
    var newDisciplineTab = new DisciplineStage();
    newDisciplineTab.bgColor = firstGroup.bgColor;
    newDisciplineTab.name = firstGroup.name;
    newDisciplineTab.matches = firstGroup.matches.slice(count, firstGroup.matches.length);
    firstGroup.matches.splice(count, count);
    return newDisciplineTab;
  }

  onTabSelected(selectedTab: DisciplineTab){
    this.currentIndex = this.currentTabs.indexOf(selectedTab);
    this.setTabForIndex(this.currentIndex);
  }

}