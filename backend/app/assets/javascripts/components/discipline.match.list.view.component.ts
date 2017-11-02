import {Component, Input} from "@angular/core";
import {MatchDto} from "../data/match.dto";
import {MatchListDto} from "../data/match.list.dto";
import {TypeColors} from "../data/typeColors";
import {DisciplineShortcuts} from "../data/disciplineShortcuts";
import {Type} from "../data/type";
import {MatchListService} from "../services/match.list.service";
import {MatchService} from "../services/match.service";

@Component({
    selector: "discipline-match-list",
    templateUrl : "assets/javascripts/views/discipline.match.list.view.component.html",
})
export class DisciplineMatchListComponent{

    public matches: Array<MatchDto>;
    public colorArray: string[];
    public disciplines:Array<Type>;
    public selectedDiscipline:any;
    public disciplineType:string[];

    constructor(private matchListService: MatchListService, private matchService: MatchService){
       this.getAllMatches()
       this.colorArray = TypeColors.TYPE_COLORS;
       this.disciplineType = DisciplineShortcuts.TYPE;
    }

    private getAllMatches(){
        this.matchService.getAllOpenMatches().subscribe(
            this.getAllMatchesSuccess.bind(this),
            this.getAllMatchesError
        )
    }

    private getAllMatchesSuccess(matches: MatchDto[]){
        this.matches = matches;
    }
    private getAllMatchesError(error){
        console.log("error on get All matches");
        console.log(error);
    }

    public onTableAssigned(dragData: any){
        var isGroup = dragData.isGroup;
        if(isGroup === false){
            this.matches.splice(dragData.index, 1);
            return;
        }
        if(dragData.match.group != null){
            var groupId = dragData.match.group.id;
            var matchIndex = this.matches.length;
            var currentMatch = null;
            for(;matchIndex > -1; matchIndex--){
                currentMatch = this.matches[matchIndex];
                if(currentMatch !== null && currentMatch !== undefined && currentMatch.group.id === groupId){
                    this.matches.splice(matchIndex, 1);
                }
            }
        }
        
    }

    onTypeChanged(event){
        this.onDisciplineChanged(event);
    }

    onDisciplineChanged(typeId: any){
        this.selectedDiscipline = typeId;
        if (this.selectedDiscipline === "0"){
            this.getAllMatches();
            return;
        }
        if (this.selectedDiscipline === "-1"){
            this.getWaitingList();
            return;
        }
        this.matchService.getOpenMatchesByType(this.selectedDiscipline).subscribe(this.matchesChanged.bind(this));
    }


    getWaitingList(){
        this.matchListService.getCompleteMatchlist().subscribe(this.onMatchlistLoaded.bind(this));
    }

    onMatchlistLoaded(matches: MatchListDto[]){
        this.matches = [];
        if(matches === null || matches === undefined){
            console.log("Empty Matches on matchlist loaded");
            return;
        }
        matches.forEach(element => {
            if(element !== null && element !== undefined && element.matchinfo !== null){
                this.matches.push(element.matchinfo);
            }
        });
    }

    matchesChanged(matches: MatchDto[]){
        this.matches = matches;
    }

   
}