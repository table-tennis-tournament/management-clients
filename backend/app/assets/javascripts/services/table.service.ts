import {Match} from "../data/match"
import {Table} from "../data/table"
import {Player} from "../data/player"
import {Club} from "../data/club"
import {Type} from "../data/type"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";
import {WebSocketService} from "./web.socket.service";
import {MatchListService} from "./match.list.service"

@Injectable()
export class TableService {
  private allTablesUrl = "table/all";

  private lockTableUrl = "table/tableNumber/lock";
  private freeTableUrl = "table/tableNumber/free";
  private takeBackTableUrl = "table/tableNumber/free";
  public OnTableChanged: Observable<Match>;
  private tableObserver: any;
  private typeArray: Type[] = [];

  constructor(private http: Http, private webSocketService: WebSocketService, private matchListService: MatchListService){
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
      this.matchListService.getNextMatch().subscribe(
          this.informNextMatchListeners.bind(this),
          this.handleErrorOnNextMatchRequest
      )
  }

  informNextMatchListeners(match: Match){
      console.log("Inform listeners: ");
      console.log(match);
      this.tableObserver.next(match);
  }

  handleErrorOnNextMatchRequest(error){
      console.log("An error on receive next match: ");
      console.log(error);
  }

  handleWebSocketError(error){
      console.log("on error received" + error);
  }

  handleWebSocketCompleted(){
      console.log("web socket completed received");
  }

  getAllTables(): Observable<Table[]>{
        return this.http.get(this.allTablesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  freeTable(tableId: number){
      return this.http.get(this.replaceTableNumer(tableId, this.freeTableUrl))
  }

  lockTable(tableId: number): Observable<Response>{
      return this.http.get(this.replaceTableNumer(tableId, this.lockTableUrl))
  }

  takeBackTable(tableId: number){
      return this.http.get(this.replaceTableNumer(tableId, this.takeBackTableUrl))
  }

  replaceTableNumer(tableNumber: number, url: string): string{
      var regEx = new RegExp("tableNumber");
      return this.lockTableUrl.replace(regEx, tableNumber.toString());
  }

  getRandomTables(): Table[]{
      console.log("getAllTables called");
      var tables: Table[] = [];
      for (var n = 0; n <= 23; n++) {         
            var newTable = new Table();
            newTable.id = n+1;
            newTable.tableNumber = n+1;
            newTable.match = this.getRandomMatch();
            newTable.match.id = n+2;
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