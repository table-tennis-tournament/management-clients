import {Component, Input} from "@angular/core";
import {FilterCriteria} from "../../data/filterCriteria";

@Component({
    selector: "match-filter",
    templateUrl : "assets/javascripts/views/filter/match.filter.component.html"
})
export class MatchFilterComponent{

    public filterCriterias: FilterCriteria[];
    public rowCount: number[];

    constructor(){
        this.filterCriterias = [];
        this.filterCriterias[0] = new FilterCriteria("discipline", 1, 1);
        this.filterCriterias[1] = new FilterCriteria("discipline", 1, 1);
        this.rowCount = Array.from(Array(Math.ceil(this.filterCriterias.length / 2)).keys());
    }
}