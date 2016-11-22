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
    public tableNumber: string;
    public firstClubName: string;
    public secondClubName:string;
    public stage: string;

    public colorArray: string[] = [];
    
    _match: Match;
    get match(): Match {
        return this._match;
    }

    @Input("match")
    set match(value: Match){
        console.log(value);
        this._match = value;
        this._match.stage = "Achtelfinale";
        this.firstOpponent = "Fritz Walter-Maier";
        this.secondOpponent = "Walter Maier";
        this.bgColor = this.colorArray[this.getRandomInt(1, 6)];
        this.tableNumber = this.getRandomInt(1, 25);
        this.firstClubName = "(ASV Grünwettersbach)";
        this.secondClubName = "(TTV Ettlingen)";
    } 

    constructor(){
        console.log(this.match);
        this.colorArray[1] = "indigo";
        this.colorArray[2] = "blue";
        this.colorArray[3] = "red";
        this.colorArray[4] = "deep-orange";
        this.colorArray[5] = "brown";
        this.colorArray[6] = "deep-purple";
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}