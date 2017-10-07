import {Component, Input} from "@angular/core";
import {MatchDto} from "../data/match.dto";
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
       this.matchService.getAllTypes().subscribe(this.allTypesSelected.bind(this))
       this.colorArray = TypeColors.TYPE_COLORS;
       this.disciplineType = DisciplineShortcuts.TYPE;
    }

    private getAllMatches(){
        this.matchService.getAllMatches().subscribe(
            this.getAllMatchesSuccess.bind(this),
            this.getAllMatchesError
        )
    }

    private allTypesSelected(allTypes: Type[]){
        this.disciplines = allTypes;
    }

    private getAllMatchesSuccess(matches: MatchDto[]){
        this.matches = matches;
    }
    private getAllMatchesError(error){
        console.log("error on get All matches");
        console.log(error);
    }

    onDisciplineChanged(){
        if (this.selectedDiscipline === "0"){
            this.getAllMatches();
            return;
        }
        this.matchService.getMatchesByType(this.selectedDiscipline).subscribe(this.matchesChanged.bind(this));
    }

    matchesChanged(matches: MatchDto[]){
        this.matches = matches;
    }

   
}