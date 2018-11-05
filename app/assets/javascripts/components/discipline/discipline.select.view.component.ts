import {Component, EventEmitter, Input, Output} from "@angular/core";
import {TypeColors} from "../../data/typeColors";
import {DisciplineShortcuts} from "../../data/disciplineShortcuts";
import {Type} from "../../data/type";
import {MatchService} from "../../services/match.service";

@Component({
    selector: "discipline-select",
    templateUrl : "assets/javascripts/views/discipline/discipline.select.view.component.html",
})
export class DisciplineSelectViewComponent{

    public colorArray: string[];
    public disciplines:Array<Type>;
    public selectedDiscipline:any;
    public disciplineType:string[];

    @Input() showWaitingList:boolean;

    @Output() onTypeChanged = new EventEmitter<Type>();

    constructor(private matchService: MatchService){
       this.matchService.getAllOpenTypes().subscribe(this.allTypesSelected.bind(this))
       this.colorArray = TypeColors.TYPE_COLORS;
       this.disciplineType = DisciplineShortcuts.TYPE;
    }

    private allTypesSelected(allTypes: Type[]){
        var result = []
        if(this.showWaitingList){
            result.push(new Type("Warteschlange", -1));

        }
        result.push(new Type("Alle", 0));
        result = result.concat(allTypes);
        this.disciplines = result;
        this.selectedDiscipline = this.disciplines[0].id;
    }

    onDisciplineChanged(){
       this.onTypeChanged.emit(this.selectedDiscipline);
    }

}