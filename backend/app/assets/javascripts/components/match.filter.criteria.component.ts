import {Component, Input} from "@angular/core";
import {Match} from "../data/match";
import {FilterCriteria} from "../data/filterCriteria";

@Component({
    selector: "match-filter-criteria",
    templateUrl : "assets/javascripts/views/match.filter.criteria.component.html"
})
export class MatchFilterCriteriaComponent{
    _criteria: FilterCriteria;
    get criteria(): FilterCriteria {
        return this._criteria;
    }

    @Input("criteria")
    set criteria(value: FilterCriteria){
        this._criteria = value;
       
    } 
}