import {Match} from "../data/match"
import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
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
  private unlockTableUrl = "table/tableNumber/unlock";
  public OnTableChanged: Observable<Match>;
  private tableObserver: any;
  

  constructor(private http: Http, private webSocketService: WebSocketService, private matchListService: MatchListService){
      this.initTableChangedObserver();
      this.subscribeToWebSocket();
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
      console.log("on error received");
      console.log(error);
  }

  handleWebSocketCompleted(){
      console.log("web socket completed received");
  }

  getAllTables(): Observable<TableDto[]>{
        return this.http.get(this.allTablesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  freeTable(tableId: number){
      console.log("free table is called: "+ tableId);
      return this.http.get(this.replaceTableNumer(tableId, this.freeTableUrl))
  }

  lockTable(tableId: number): Observable<Response>{
      return this.http.get(this.replaceTableNumer(tableId, this.lockTableUrl))
  }

  unlockTable(tableId: number): Observable<Response>{
      return this.http.get(this.replaceTableNumer(tableId, this.unlockTableUrl))
  }

  takeBackTable(tableId: number){
      return this.http.get(this.replaceTableNumer(tableId, this.takeBackTableUrl))
  }

  replaceTableNumer(tableNumber: number, url: string): string{
      var regEx = new RegExp("tableNumber");
      return url.replace(regEx, tableNumber.toString());
  }

  

}