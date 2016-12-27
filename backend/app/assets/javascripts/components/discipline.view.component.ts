import {Component, Input} from "@angular/core";
import {DisciplineTab} from "../data/discipline.tab"
import {DisciplineGroup} from "../data/discipline.group"
import {MatchDto} from "../data/match.dto"
import {RandomMatchService} from "../services/random.match.service"
import {MatchService} from "../services/match.service"

@Component({
    selector: "discipline-view",
    templateUrl : "assets/javascripts/views/discipline.view.component.html"
})
export class DisciplineViewComponent{
    public tabs: DisciplineTab[];

    constructor(private randomMatchService: RandomMatchService, private matchService: MatchService){
        this.tabs = [];
        this.tabs[0] = new DisciplineTab(1, "Herren B");
        this.tabs[0].groups = this.getDisciplineGroups(27);
        this.tabs[1] = new DisciplineTab(2, "Herren C");
        this.tabs[1].groups = this.getDisciplineGroups(5);
        this.tabs[2] = new DisciplineTab(3, "Herren D");
        this.tabs[2].groups = this.getDisciplineGroups(2);
        this.tabs[3] = new DisciplineTab(4, "Herren E");
        this.tabs[3].groups = this.getDisciplineGroups(22);
        this.matchService.getAllMatches().subscribe(this.handleAllMatches.bind(this));
    }

    handleAllMatches(result: MatchDto[]){
        console.log("inside handle all matches");
        var tabList: DisciplineTab[] = [];
        var allPlayerArray: boolean[] = [];
        for(var index=0; index < result.length; index++){
            var currentItem = result[index];
            if(!currentItem.group){
                continue;
            }
            if(!tabList[currentItem.type.id]){
                tabList[currentItem.type.id] = new DisciplineTab(currentItem.type.id, currentItem.type.name);
            }
            var currentItemTab = tabList[currentItem.type.id];
            
            if(!currentItemTab.groups[currentItem.group.id]){
                currentItemTab.groups[currentItem.group.id]=new DisciplineGroup();
                currentItemTab.groups[currentItem.group.id].name = "Gruppe "+currentItem.group.name;
                allPlayerArray = [];
            }
            var currentGroup = currentItemTab.groups[currentItem.group.id];
            currentGroup.matches.push(currentItem);
            if(!allPlayerArray[currentItem.team1[0].id]){
                currentGroup.players.push(currentItem.team1[0]);
                allPlayerArray[currentItem.team1[0].id] = true;
            }
        }
        this.tabs = this.clearTabList(tabList);
    }

    clearTabList(tabListToClean: DisciplineTab[]): DisciplineTab[]{
        var cleanedResult: DisciplineTab[] = [];
        tabListToClean.forEach(element => {
           if(element){
               element.groups = this.getCleanedGroups(element.groups);
               cleanedResult.push(element);
           } 
        });
        return cleanedResult;
    }

    getCleanedGroups(groupsToClean: DisciplineGroup[]){
        var cleanedResult: DisciplineGroup[] = [];
        groupsToClean.forEach(element => {
           if(element){
               cleanedResult.push(element);
           } 
        });
        return cleanedResult;
    }

    getDisciplineGroups(count: number): DisciplineGroup[]{
        var result: DisciplineGroup[] = [];
        for(var i=0; i< count; i++){
            result[i] = new DisciplineGroup();
            result[i].players = this.randomMatchService.getPlayers(4);
        }
        return result;
    }
   
}