import {Component, Input} from "@angular/core";
import {Type} from "../../data/type";

@Component({
    selector: "discipline-match-item",
    templateUrl : "assets/javascripts/views/items/discipline.match.item.component.html",
})
export class DisciplineMatchItemComponent{

    @Input() discipline:Type;

    constructor(){
        console.log("on out");
    }

   
}