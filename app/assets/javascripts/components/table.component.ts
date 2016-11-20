import {Component, Input} from "@angular/core"
import {Match} from "../data/Match"


@Component({
    selector: "tt-table",
    templateUrl : "assets/javascripts/views/table.component.html"
})
export class TableComponent{

    public firstOpponent: string;
    public secondOpponent: string;
    public bgColor: string;

    _match: Match;
    get match(): Match {
    return this._match;
}

    @Input("match")
    set match(value: Match){
        console.log(value);
        this._match = value;
        this.firstOpponent = "Fritz Walter";
        this.secondOpponent = "Walter Maier";
        this.bgColor = "orange";
    } 

    constructor(){
        console.log(this.match);
    }
}