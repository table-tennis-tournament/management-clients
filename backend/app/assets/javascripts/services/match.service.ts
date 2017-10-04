import {MatchDto} from "../data/match.dto"
import {IResult} from "../data/result"
import {Type} from "../data/type"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";

@Injectable()
export class MatchService {
  private allMatchesUrl = "match/all";
  private allTypesUrl = "types/all";
  private getMatchesByTypeUrl = "match/typeid/typeIdValue";
  private addResultString = "match/matchId/result";
  private assignMatchToTableUrl = "match/matchtotable/matchId/tableName";
  private assignGroupToTableUrl = "match/grouptotable/groupId/tableName";

  constructor(private http: Http){}

  getAllMatches(): Observable<MatchDto[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  assignMatchToTable(matchId: number, tableName: number): Observable<any>{
    var regEx = new RegExp("matchId");
    var url = this.assignMatchToTableUrl.replace(regEx, matchId.toString());
    regEx = new RegExp("tableName");
    url = url.replace(regEx, tableName.toString());
    return this.http.put(url, JSON.stringify(""), {headers: this.getHeaders()})
         .map(res => res.json());
  }

  assignGroupToTable(groupId: number, tableName: number): Observable<any>{
    var regEx = new RegExp("groupId");
    var url = this.assignGroupToTableUrl.replace(regEx, groupId.toString());
    regEx = new RegExp("tableName");
    url = url.replace(regEx, tableName.toString());
    return this.http.put(url, JSON.stringify(""), {headers: this.getHeaders()})
         .map(res => res.json());
  }

  getHeaders(){
    var headers = new Headers();
    headers.append("Content-Type", "application/json");
    return headers;
  }

  addResult(resultToHandle: IResult[], matchId: number){
    var regEx = new RegExp("matchId");
    var url = this.addResultString.replace(regEx, matchId.toString());
    console.log("before http post: " + url)
    return this.http.post(url, resultToHandle);
  }

  getAllTypes(): Observable<Type[]>{
    return this.http.get(this.allTypesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getMatchesByType(typeId: number): Observable<MatchDto>{
    var regEx = new RegExp("typeIdValue");
    var url = this.getMatchesByTypeUrl.replace(regEx, typeId.toString());
        
    return this.http.get(url).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
