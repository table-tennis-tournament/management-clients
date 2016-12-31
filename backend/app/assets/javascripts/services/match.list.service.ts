import {MatchListDto} from "../data/match.list.dto"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";


@Injectable()
export class MatchListService {
    private nextMatchUrl = "matchlist/next";
    private allMatchListUrl = "matchlist/all";
    private deleteMatchListItemUrl = "matchlist/deleteMatch/itemId ";
    private addMatchListItemUrl = "matchlist/match/matchId/position ";
    private deleteGroupListItemUrl = "matchlist/deleteGroup/itemId ";
    private addGroupListItemUrl = "matchlist/deleteGroup/itemId ";

    constructor(private http: Http){}

    getNextMatch(): Observable<MatchListDto>{
        return this.http.get(this.nextMatchUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error || "Server error"));
    }

    getCompleteMatchlist(): Observable<MatchListDto[]>{
        return this.http.get(this.allMatchListUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
    }

    deleteMatchListItem(itemToDelete: MatchListDto): Observable<any>{
        var regEx = new RegExp("itemId");
        var url = this.deleteMatchListItemUrl.replace(regEx, itemToDelete.matchListItem.id.toString());
        return this.http.delete(url).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
    }

    addMatchListItem(matchId: number, position: number): Observable<any>{
        var headers = new Headers();
        headers.append("Content-Type", "application/json");
        var regEx = new RegExp("matchId");
        var url = this.addMatchListItemUrl.replace(regEx, matchId.toString());
        regEx = new RegExp("position");
        url = url.replace(regEx, position.toString());
        return this.http.put(url, JSON.stringify(""), {headers: headers})
             .map(res => res.json());
    }
}