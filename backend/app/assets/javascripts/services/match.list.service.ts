import {MatchListDto} from "../data/match.list.dto"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";
import { BaseService } from "../services/base.service";


@Injectable()
export class MatchListService {
    private nextMatchUrl = "matchlist/next";
    private allMatchListUrl = "matchlist/all";
    private deleteMatchListItemUrl = "matchlist/deleteMatch/itemId ";
    private addMatchListItemUrl = "/matchlist/addMatch";
    private deleteGroupListItemUrl = "matchlist/deleteGroup/itemId ";
    private addGroupListItemUrl = "matchlist/addGroup/groupId/position ";
    private addGroupToTableUrl = "/matchlist/grouptotable/groupId/tableNumber ";
    private matchlistActiveUrl = "/matchlist/active";
      
    constructor(private http: Http, private baseService: BaseService){}

    getNextMatch(): Observable<MatchListDto>{
        return this.http.get(this.nextMatchUrl).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
    }

    getCompleteMatchlist(): Observable<MatchListDto[]>{
        return this.http.get(this.allMatchListUrl).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
    }

    deleteMatchListItem(matchId: any): Observable<any>{
        var regEx = new RegExp("itemId");
        var url = this.deleteMatchListItemUrl.replace(regEx, matchId);
        return this.http.delete(url).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
    }

    addMatchListItem(matches: MatchListDto[]): Observable<any>{
        return this.http.post(this.addMatchListItemUrl, JSON.stringify(matches), this.baseService.getHeaders())
             .map(res => res.json());
    }

    addGroupListItem(groupId: number, position:number): Observable<any>{
        var regEx = new RegExp("groupId");
        var url = this.addGroupListItemUrl.replace(regEx, groupId.toString());
        regEx = new RegExp("position");
        url = url.replace(regEx, position.toString());
        return this.http.put(url, JSON.stringify(""), {headers:  this.getHeaders()})
             .map(res => res.json());
    }

    setGroupOnTable(groupId: number, tableNumber:number):Observable<any>{
        var regEx = new RegExp("groupId");
        var url = this.addGroupToTableUrl.replace(regEx, groupId.toString());
        regEx = new RegExp("tableNumber");
        url = url.replace(regEx, tableNumber.toString());
        return this.http.put(url, JSON.stringify(""), {headers: this.getHeaders()})
             .map(res => res.json());
    }

    getHeaders():Headers{
        var headers = new Headers();
        headers.append("Content-Type", "application/json");
        return headers;
    }

    getMatchlistActive(): Observable<boolean>{
        return this.http.get(this.matchlistActiveUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
    }

    setMatchlistActive(isActive:boolean):Observable<any>{
        var query = this.matchlistActiveUrl + "?isActive="+isActive.toString();
        return this.http.post(query, JSON.stringify({}), {headers: this.getHeaders()});
    }

}