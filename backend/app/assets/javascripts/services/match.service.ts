import {MatchDto} from "../data/match.dto"
import {IResult} from "../data/result"
import {Type} from "../data/type"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";

@Injectable()
export class MatchService {

  private allMatchesUrl = "match/all";
  private allOpenMatchesUrl = "match/open/all";
  
  private getMatchesByTypeUrl = "match/typeid/typeIdValue";
  private getOpenMatchesByTypeUrl = "match/open/typeid/typeIdValue";

  private addResultString = "match/matchId/result";

  private assignMatchToTableUrl = "match/matchtotable/matchId/tableName";
  private assignGroupToTableUrl = "match/grouptotable/groupId/tableName";

  private getPlayedMatchesUrl = "match/open/all";
  private getPlayedMatchesByTypeUrl = "match/open/typeid/typeIdValue";

  private allTypesUrl = "types/all";
  private allOpenTypesUrl = "types/open/all ";

  constructor(private http: Http){}

  getAllMatches(): Observable<MatchDto[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getAllOpenMatches(): Observable<MatchDto[]>{
    return this.http.get(this.allOpenMatchesUrl).map((res:Response) => res.json())
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
    return this.http.post(url, resultToHandle);
  }

  getAllTypes(): Observable<Type[]>{
    return this.http.get(this.allTypesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getAllOpenTypes(): Observable<Type[]>{
    return this.http.get(this.allOpenTypesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getMatchesByType(typeId: number): Observable<MatchDto>{
    var regEx = new RegExp("typeIdValue");
    var url = this.getMatchesByTypeUrl.replace(regEx, typeId.toString());
        
    return this.http.get(url).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getOpenMatchesByType(typeId: number): Observable<MatchDto>{
    var regEx = new RegExp("typeIdValue");
    var url = this.getOpenMatchesByTypeUrl.replace(regEx, typeId.toString());
        
    return this.http.get(url).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getAllPlayedMatches():Observable<MatchDto>{
    return this.http.get(this.getPlayedMatchesUrl).map((res:Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getPlayedMatchesByTypeId(typeId: number):Observable<MatchDto>{
    var regEx = new RegExp("typeIdValue");
    var url = this.getPlayedMatchesByTypeUrl.replace(regEx, typeId.toString());
       
    return this.http.get(url).map((res:Response) => res.json())
        .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
