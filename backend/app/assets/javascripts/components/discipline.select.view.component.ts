import {Component, Input, Output, EventEmitter} from "@angular/core";
import {TypeColors} from "../data/typeColors";
import {DisciplineShortcuts} from "../data/disciplineShortcuts";
import {Type} from "../data/type";
import {MatchService} from "../services/match.service";

@Component({
    selector: "discipline-select",
    templateUrl : "assets/javascripts/views/discipline.select.view.component.html",
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
        result.push(new Type("Alle", 0));
        if(this.showWaitingList){
            result.push(new Type("Warteschlange", -1));
        }
        result = result.concat(allTypes);
        this.disciplines = result;
    }

    onDisciplineChanged(){
       this.onTypeChanged.emit(this.selectedDiscipline);
    }

}