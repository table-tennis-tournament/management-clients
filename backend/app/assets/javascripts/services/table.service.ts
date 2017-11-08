import {MatchListDto} from "../data/match.list.dto"
import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
import {Player} from "../data/player"
import {Club} from "../data/club"
import {Type} from "../data/type"
import {StatusDto} from "../data/status.dto"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";
import {WebSocketService} from "./web.socket.service";
import {MatchListService} from "./match.list.service"
import {BaseService} from "./base.service"

@Injectable()
export class TableService {
  private allTablesUrl = "table/all";
  private tableByIdUrl = "table/tableNumber";
  private lockTableUrl = "table/tableNumber/lock";
  private freeTableUrl = "match/free";
  private takeBackTableUrl = "match/takeBack ";
  private unlockTableUrl = "table/tableNumber/unlock";
  
  public OnTableChanged: Observable<MatchListDto[]>;
  private tableObserver: any;
  

  constructor(private http: Http, private webSocketService: WebSocketService, private matchListService: MatchListService, private baseService:BaseService){
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

    //   this.matchListService.getNextMatch().subscribe(
    //       this.informNextMatchListeners.bind(this),
    //       this.handleErrorOnNextMatchRequest
    //   )
  }

  informNextMatchListeners(matches: MatchListDto[]){
      console.log("Inform listeners: ");
      console.log(matches);
      this.tableObserver.next(matches);
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

  getTableById(id: any): Observable<TableDto[]>{
    return this.http.get(this.replaceTableNumer(id, this.tableByIdUrl)).map((res:Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  freeTable(matchIds: number[]):Observable<StatusDto>{
      return this.http.post(this.freeTableUrl, JSON.stringify(matchIds), this.baseService.getHeaders()).map((res:Response) => res.json());
  }

  lockTable(tableId: number): Observable<Response>{
      return this.http.get(this.replaceTableNumer(tableId, this.lockTableUrl))
  }

  unlockTable(tableId: number): Observable<Response>{
      return this.http.get(this.replaceTableNumer(tableId, this.unlockTableUrl))
  }

  takeBackTable(matchIds: number[]):Observable<StatusDto>{
      return this.http.post(this.takeBackTableUrl, JSON.stringify(matchIds), this.baseService.getHeaders()).map((res:Response) => res.json());
    //   return this.http.get(this.replaceTableNumer(tableId, this.takeBackTableUrl))
  }

  replaceTableNumer(tableNumber: number, url: string): string{
      var regEx = new RegExp("tableNumber");
      return url.replace(regEx, tableNumber.toString());
  }

  

}