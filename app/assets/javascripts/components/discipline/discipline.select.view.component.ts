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
        let result = [];
        if(this.showWaitingList){
            result.push({
                id: -1,
                name: "Warteschlange"
            });
        }
        result.push({
            id: 0,
            name: "Alle"
        });
        result = result.concat(allTypes);
        this.disciplines = result;
        this.selectedDiscipline = this.disciplines[0].id;
    }

}