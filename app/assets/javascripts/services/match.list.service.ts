import {MatchListDto} from "../data/match.list.dto"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";
import { BaseService } from "../services/base.service";
import { MatchListItem } from "../data/match.list.item";
import { StatusDto } from "../data/status.dto";


@Injectable()
export class MatchListService {
    private nextMatchUrl = "matchlist/next";
    private allMatchListUrl = "matchlist/all";
    private deleteMatchListItemUrl = "matchlist/deleteMatch/itemId ";
    private addMatchListItemUrl = "/matchlist/addMatch";
    private moveMatchListItemUrl = "/matchlist/move/itemId/position";
    private deleteGroupListItemUrl = "matchlist/deleteGroup/itemId ";
    private addGroupListItemUrl = "matchlist/addGroup/groupId/position ";
    private addGroupToTableUrl = "/matchlist/grouptotable/groupId/tableNumber ";
    private autoStartUrl = "/matchlist/autostart";
    
      
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

    addMatchListItem(matches: MatchListItem): Observable<StatusDto>{
        return this.http.post(this.addMatchListItemUrl, JSON.stringify(matches), this.baseService.getHeaders())
             .map(res => res.json()).catch(this.baseService.HandleError);
    }

    transferMatchListItem(match: MatchListItem, newPosition: number): Observable<StatusDto>{
        var regEx = new RegExp("itemId");
        var url = this.moveMatchListItemUrl.replace(regEx, match.id);
        regEx = new RegExp("position");
        url = url.replace(regEx, newPosition.toString());
        return this.http.get(url)
            .map(res => res.json());
    }

    addGroupListItem(groupId: number, position:number): Observable<any>{
        var regEx = new RegExp("groupId");
        var url = this.addGroupListItemUrl.replace(regEx, groupId.toString());
        regEx = new RegExp("position");
        url = url.replace(regEx, position.toString());
        return this.http.put(url, JSON.stringify(""), this.baseService.getHeaders())
             .map(res => res.json());
    }

    setGroupOnTable(groupId: number, tableNumber:number):Observable<any>{
        var regEx = new RegExp("groupId");
        var url = this.addGroupToTableUrl.replace(regEx, groupId.toString());
        regEx = new RegExp("tableNumber");
        url = url.replace(regEx, tableNumber.toString());
        return this.http.put(url, JSON.stringify(""), this.baseService.getHeaders())
             .map(res => res.json());
    }

    autoStart():Observable<StatusDto>{
        return this.http.get(this.autoStartUrl).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
    }

    // getMatchlistActive(): Observable<boolean>{
    //     return this.http.get(this.matchlistActiveUrl).map((res:Response) => res.json())
    //            .catch(this.baseService.HandleError);
    // }

  

}