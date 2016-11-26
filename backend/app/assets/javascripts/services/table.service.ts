import {Match} from "../data/match"
import {Table} from "../data/table"
import {Player} from "../data/player"
import {Club} from "../data/club"
import {Type} from "../data/type"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";
import {WebSocketService} from "./web.socket.service";

@Injectable()
export class TableService {
  private allMatchesUrl = "table/all";

  constructor(private http: Http, private webSocketService: WebSocketService){
      
      
      console.log(this.webSocketService.wsObservable);
      this.subscribeToWebSocket();
      
  }

  subscribeToWebSocket(){
      try {
          this.webSocketService.wsObservable.subscribe((data) => {
                console.log("data received: " + data);
            },
            (error) => {
                console.log("on error received")
            },
            () => {
                console.log("completed received");
            });
      } catch (error) {
          console.log(error);
      }

  }

  getAllMatches(): Observable<Match[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getAllTables(): Table[]{
      console.log("inside all TAbles");
      var tables: Table[] = [];
      for (var n = 0; n <= 23; n++) {         
            var newTable = new Table();
            newTable.id = n+1;
            newTable.tableNumber = n+1;
            newTable.match = this.getRandomMatch();
            newTable.isLocked = false;
            tables[n] = newTable;
      }
      console.log(tables);
      return tables;
  }

  getRandomMatch(): Match{
      var result = new Match();
      result.colorId = this.getRandomInt(1,6);
      result.stage = "Achtelfinale";
      result.team1 = this.getPlayer("Heinz", "Schmidt", "ASV Grünwettersbach");
      result.team2 = this.getPlayer("Walter", "Maier", "TTV Ettlingen");
      result.type = this.getRandomType()
      return result;
  }

  getRandomInt(min, max) {
        min= Math.ceil(min);
        max= Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    getPlayer(firstName: string, lastName: string, clubName: string): Player[]{
        return [new Player(firstName, lastName, new Club(clubName))];
    }

    getRandomType(): Type {
        return new Type("Herren B");
    }


}