import {MatchDto} from "../data/match.dto"
import {IResult} from "../data/result"
import {Type} from "../data/type"
import {Injectable} from "@angular/core"
import {Http, Response} from "@angular/http"
import {Observable} from "rxjs/Rx";
import {BaseService} from "../services/base.service";
import {StatusDto} from "app/assets/javascripts/data/status.dto";

@Injectable()
export class MatchService {

  private allMatchesUrl = "api/match/all";
  private allOpenMatchesUrl = "api/match/open/all";
  
  private getMatchesByTypeUrl = "api/match/typeid/typeIdValue";
  private getOpenMatchesByTypeUrl = "api/match/open/typeid/typeIdValue";

  private addResultString = "api/match/matchId/result";
  private loadNewUrl = "api/match/loadnew";

  private assignMatchToTableUrl = "api/match/matchtotable/tableName";
  private assignGroupToTableUrl = "api/match/grouptotable/groupId/tableName";
  private assignSecondMatchToTableUrl = "api/match/matchtosecondtable/tableName";

  private getPlayedMatchesUrl = "api/match/played/all";
  private getPlayedMatchesByTypeUrl = "api/match/played/typeid/typeIdValue";

  private allTypesUrl = "api/types/all";
  private allOpenTypesUrl = "api/types/open/all ";

  constructor(private http: Http, private baseService: BaseService){}

  getAllMatches(): Observable<MatchDto[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  getAllOpenMatches(): Observable<MatchDto[]>{
    return this.http.get(this.allOpenMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  assignMatchToTable(matchIds: number[], tableName: number): Observable<any>{
    var url = this.assignMatchToTableUrl;
    var regEx = new RegExp("tableName");
    url = url.replace(regEx, tableName.toString());
    return this.http.post(url, JSON.stringify(matchIds), this.baseService.getHeaders())
         .map(res => res.json());
  }

  assignSecondMatchToTable(matchIds: number[], tableName: number): Observable<any>{
    var url = this.assignSecondMatchToTableUrl;
    var regEx = new RegExp("tableName");
    url = url.replace(regEx, tableName.toString());
    return this.http.post(url, JSON.stringify(matchIds), this.baseService.getHeaders())
         .map(res => res.json());
  }

  assignGroupToTable(groupId: number, tableName: number): Observable<any>{
    var regEx = new RegExp("groupId");
    var url = this.assignGroupToTableUrl.replace(regEx, groupId.toString());
    regEx = new RegExp("tableName");
    url = url.replace(regEx, tableName.toString());
    return this.http.put(url, JSON.stringify(""), )
         .map(res => res.json());
  }

  addResult(resultToHandle: IResult[], matchId: number):Observable<StatusDto>{
    var regEx = new RegExp("matchId");
    var url = this.addResultString.replace(regEx, matchId.toString());
    return this.http.post(url, resultToHandle).map((res:Response) => res.json());
  }

  getAllTypes(): Observable<Type[]>{
    return this.http.get(this.allTypesUrl).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
  }

  getAllOpenTypes(): Observable<Type[]>{
    return this.http.get(this.allOpenTypesUrl).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
  }

  syncMatches(): Observable<StatusDto>{
    return this.http.get(this.loadNewUrl).map((res:Response) => res.json())
      .catch(this.baseService.HandleError); 
  }

  getMatchesByType(typeId: number): Observable<MatchDto>{
    var regEx = new RegExp("typeIdValue");
    var url = this.getMatchesByTypeUrl.replace(regEx, typeId.toString());
        
    return this.http.get(url).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
  }

  getOpenMatchesByType(typeId: number): Observable<MatchDto>{
    if(typeId === null || typeId === undefined){
      return new Observable<MatchDto>();
    }
    var regEx = new RegExp("typeIdValue");
    var url = this.getOpenMatchesByTypeUrl.replace(regEx, typeId.toString());
        
    return this.http.get(url).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
  }

  getAllPlayedMatches():Observable<MatchDto>{
    return this.http.get(this.getPlayedMatchesUrl).map((res:Response) => res.json())
        .catch(this.baseService.HandleError);
  }

  getPlayedMatchesByTypeId(typeId: number):Observable<MatchDto>{
    var regEx = new RegExp("typeIdValue");
    var url = this.getPlayedMatchesByTypeUrl.replace(regEx, typeId.toString());
       
    return this.http.get(url).map((res:Response) => res.json())
        .catch(this.baseService.HandleError);
  }

}
