import {MatchListDto} from "../data/match.list.dto"
import {TableDto} from "../data/table.dto"
import {StatusDto} from "../data/status.dto"
import {Injectable} from "@angular/core"
import {Http, Response} from "@angular/http"
import {Observable} from "rxjs/Rx";
import {WebSocketService} from "./web.socket.service"
import {MatchListService} from "./match.list.service"
import {BaseService} from "./base.service"

@Injectable()
export class TableService {

  private allTablesUrl = "api/table/all";
  private tableByIdUrl = "api/table/tableNumber";
  private lockTableUrl = "api/table/tableNumber/lock";
  private freeMatchUrl = "api/match/free";
  private takeBackTableUrl = "api/match/takeBack";
  private unlockTableUrl = "api/table/tableNumber/unlock";
  private printMatchUrl = "api/printer/print/matchId";
  private printAllMatchesUrl = "api/printer/printAll";
  private freeTablesUrl = "api/table/free";
  
  public OnTableChanged: Observable<MatchListDto[]>;
  private tableObserver: any;
  

  constructor(private http: Http, private webSocketService: WebSocketService, private matchListService: MatchListService, private baseService:BaseService){
      this.initTableChangedObserver();
      this.subscribeToWebSocket();
  }

  subscribeToWebSocket(){
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
            this.tableObserver = observer;
        }).share();
  }

  handleWebSocketMessage(data){
      console.log("data received: " + data);
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
      return this.baseService.get(this.allTablesUrl);
  }

  getTableById(id: any): Observable<TableDto[]>{
    var url = this.replaceTableNumer(id, this.tableByIdUrl);
    return this.baseService.get(url);
  }

  freeTable(matchIds: number[]):Observable<StatusDto>{
      return this.baseService.post(this.freeMatchUrl, matchIds);
  }

  takeBackTable(matchIds: number[]):Observable<StatusDto>{
    return this.baseService.post(this.takeBackTableUrl, matchIds);
}

  getFreeTables():Observable<TableDto[]>{
      return this.baseService.get(this.freeTablesUrl);
  }

  lockTable(tableId: number): Observable<Response>{
      return this.baseService.get(this.replaceTableNumer(tableId, this.lockTableUrl))
  }

  printMatch(matchId: number):Observable<StatusDto>{
    var regEx = new RegExp("matchId");
    var url = this.printMatchUrl.replace(regEx, matchId.toString());
    return this.baseService.get(url);
  }

  printMatches(matchIds: number[]): Observable<StatusDto> {
    return this.baseService.post(this.printAllMatchesUrl, matchIds);
  }

  unlockTable(tableId: number): Observable<Response>{
      return this.baseService.get(this.replaceTableNumer(tableId, this.unlockTableUrl));
  }

  

  replaceTableNumer(tableNumber: number, url: string): string{
      var regEx = new RegExp("tableNumber");
      return url.replace(regEx, tableNumber.toString());
  }

  

}