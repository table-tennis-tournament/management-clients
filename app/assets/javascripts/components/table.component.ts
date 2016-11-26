import {Component, Input} from "@angular/core"
import {Match} from "../data/Match"
import {Table} from "../data/Table"

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

    public colorArray: string[] = [];
    
    _table: Table;
    get table(): Table {
        return this._table;
    }

    @Input("table")
    set table(value: Table){
        this._table = value;
        this.firstOpponent = this._table.match.team1[0].firstName + this._table.match.team1[0].lastName;
        this.secondOpponent = this._table.match.team2[0].firstName + this._table.match.team2[0].lastName;
        this.firstClubName = this._table.match.team1[0].club.clubName;
        this.secondClubName = this._table.match.team2[0].club.clubName;
        this.bgColor = this.colorArray[this._table.match.colorId];
    } 

    constructor(){
        this.colorArray[1] = "red";
        this.colorArray[2] = "pink";
        this.colorArray[3] = "purple";
        this.colorArray[4] = "deep-purple";
        this.colorArray[5] = "indigo";
        this.colorArray[6] = "blue";
        this.colorArray[7] = "light-blue";
        this.colorArray[8] = "cyan";
        this.colorArray[9] = "teal";
        this.colorArray[10] = "green";
        this.colorArray[11] = "light-green";

        // this.colorArray[1] = "red lighten-3";
        // this.colorArray[2] = "pink lighten-3";
        // this.colorArray[3] = "purple lighten-3";
        // this.colorArray[4] = "purple lighten-3";
        // this.colorArray[5] = "blue lighten-3";
        // this.colorArray[6] = "teal lighten-3";
    }

    
}