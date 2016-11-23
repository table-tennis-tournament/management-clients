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
        console.log(value);
        this._table = value;
        this.firstOpponent = this._table.match.team1[0].firstName + this._table.match.team1[0].lastName;
        this.secondOpponent = this._table.match.team2[0].firstName + this._table.match.team2[0].lastName;
        this.firstClubName = this._table.match.team1[0].club.clubName;
        this.secondClubName = this._table.match.team2[0].club.clubName;
        this.bgColor = this.colorArray[this._table.match.colorId];
    } 

    constructor(){
        this.colorArray[1] = "indigo";
        this.colorArray[2] = "blue";
        this.colorArray[3] = "red";
        this.colorArray[4] = "deep-orange";
        this.colorArray[5] = "brown";
        this.colorArray[6] = "deep-purple";
    }

    
}