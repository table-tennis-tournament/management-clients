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
  private nextMatchUrl = "matches/next";
  public OnTableChanged: Observable<Match>;
  private tableObserver: any;
  private typeArray: Type[] = [];

  constructor(private http: Http, private webSocketService: WebSocketService){
      this.initTableChangedObserver();
      this.subscribeToWebSocket();
      this.initTypeArray();
  }

  subscribeToWebSocket(){
      console.log("Start registering TableService on WebSocket");
      try {
          this.webSocketService.WebSocketObservable.subscribe(
              this.handleWebSocketMessage.bind(this),
                this.handleWebSocketError.bind(this),
                this.handleWebSocketCompleted.bind(this));
      } catch (error) {
          console.log(error);
      }
  }

  initTableChangedObserver(){
      this.OnTableChanged = Observable.create((observer) => {
            console.log("table changed observer is created");
            this.tableObserver = observer;

        }).share();
  }

  initTypeArray(){
      this.typeArray[0] = new Type("A-Einzel", 1);
      this.typeArray[1] = new Type("A-Doppel", 2);
      this.typeArray[2] = new Type("B-Einzel", 3);
      this.typeArray[3] = new Type("B-Doppel", 4);
      this.typeArray[4] = new Type("C-Einzel", 5);
      this.typeArray[5] = new Type("C-Doppel", 6);
      this.typeArray[6] = new Type("D-Einzel", 7);
      this.typeArray[7] = new Type("D-Doppel", 8);
      this.typeArray[8] = new Type("Damen-EZ", 9);
      this.typeArray[9] = new Type("Damen-Do", 10);
  }

  handleWebSocketMessage(data){
      console.log("data received: " + data);
      var newMatch = this.getRandomMatch();
      console.log(this.tableObserver);
      this.tableObserver.next(newMatch);
  }

  handleWebSocketError(error){
      console.log("on error received" + error);
  }

  handleWebSocketCompleted(){
      console.log("completed received");
  }

  getAllMatches(): Observable<Match[]>{
        return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getNextMatch(): Observable<Match>{
        return this.http.get(this.nextMatchUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getAllTables(): Table[]{
      console.log("getAllTables called");
      var tables: Table[] = [];
      for (var n = 0; n <= 23; n++) {         
            var newTable = new Table();
            newTable.id = n+1;
            newTable.tableNumber = n+1;
            newTable.match = this.getRandomMatch();
            newTable.isLocked = false;
            tables[n] = newTable;
      }
      return tables;
  }

  getRandomMatch(): Match{
      var result = new Match();
      result.stage = "Achtelfinale";
      result.team1 = this.getPlayer("Heinz", "Schmidt", "ASV Grünwettersbach");
      result.team2 = this.getPlayer("Walter", "Maier", "TTV Ettlingen");
      result.type = this.getRandomType()
      result.tableNumber = this.getRandomInt(1,24);
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
        return this.typeArray[this.getRandomInt(1,10)];
    }


}