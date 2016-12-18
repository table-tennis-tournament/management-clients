import {Component, Input} from "@angular/core"
import {Match} from "../data/match"
import {Table} from "../data/table"
import {MatchToStringService} from "../services/match.toString.service"

@Component({
    selector: "tt-table",
    templateUrl : "assets/javascripts/views/table.component.html"
})
export class TableComponent{

    public firstOpponent: string;
    public secondOpponent: string;
    public bgColor: string;
    public tableNumber: string;

    public colorArray: string[] = [];
    
    _table: Table;
    get table(): Table {
        return this._table;
    }

    @Input("table")
    set table(value: Table){
        console.log("Start set Table");
        this._table = value;
        this.firstOpponent = this.matchToStringService.getPlayersNamesLong(this._table.match.team1);
        this.secondOpponent = this.matchToStringService.getPlayersNamesLong(this._table.match.team2);
        this.bgColor = this.colorArray[this._table.match.type.id];
    } 

    onFree(){
        console.log("on free clicked");
        this.table.match = null;
    }

    onTakeBack(){
        console.log("on takeback clicked");
    }

    onResult(){
        console.log("on result clicked");
    }

    onLock(){
        console.log("on lock clicked");
    }

    constructor(private matchToStringService: MatchToStringService){
        this.colorArray[0] = "indigo";
        this.colorArray[1] = "indigo";
        this.colorArray[2] = "blue darken-1";
        this.colorArray[3] = "green";
        this.colorArray[4] = "light-green darken-1";
        this.colorArray[5] = "grey";
        this.colorArray[6] = "grey darken-3";
        this.colorArray[7] = "orange";
        this.colorArray[8] = "amber darken-1";
        this.colorArray[9] = "pink";
        this.colorArray[10] = "red darken-1";

        // this.colorArray[1] = "red lighten-3";
        // this.colorArray[2] = "pink lighten-3";
        // this.colorArray[3] = "purple lighten-3";
        // this.colorArray[4] = "purple lighten-3";
        // this.colorArray[5] = "blue lighten-3";
        // this.colorArray[6] = "teal lighten-3";
    }

    
}