import {MatchListDto} from "../data/match.list.dto"
import {Injectable} from "@angular/core"
import {Http, Response} from "@angular/http"
import {Observable} from "rxjs/Rx";
import {BaseService} from "../services/base.service";
import {MatchListItem} from "../data/match.list.item";
import {StatusDto} from "../data/status.dto";


@Injectable()
export class MatchListService {
    private nextMatchUrl = "api/matchlist/next";
    private allMatchListUrl = "api/matchlist/all";
    private deleteMatchListItemUrl = "api/matchlist/deleteMatch/itemId ";
    private addMatchListItemUrl = "api/matchlist/addMatch";
    private moveMatchListItemUrl = "api/matchlist/move/itemId/position";
    private deleteGroupListItemUrl = "api/matchlist/deleteGroup/itemId ";
    private addGroupListItemUrl = "api/matchlist/addGroup/groupId/position ";
    private addGroupToTableUrl = "api/matchlist/grouptotable/groupId/tableNumber ";
    private autoStartUrl = "api/matchlist/autostart";
    
      
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
        const regEx = new RegExp("itemId");
        const url = this.deleteMatchListItemUrl.replace(regEx, matchId);
        return this.http.delete(url).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
    }

    addMatchListItem(matches: MatchListItem): Observable<StatusDto>{
        return this.http.post(this.addMatchListItemUrl, JSON.stringify(matches), this.baseService.getHeaders())
             .map(res => res.json()).catch(this.baseService.HandleError);
    }

    transferMatchListItem(match: MatchListItem, newPosition: number): Observable<StatusDto>{
        let regEx = new RegExp("itemId");
        let url = this.moveMatchListItemUrl.replace(regEx, match.id);
        regEx = new RegExp("position");
        url = url.replace(regEx, newPosition.toString());
        return this.http.get(url)
            .map(res => res.json());
    }

    addGroupListItem(groupId: number, position:number): Observable<any>{
        let regEx = new RegExp("groupId");
        let url = this.addGroupListItemUrl.replace(regEx, groupId.toString());
        regEx = new RegExp("position");
        url = url.replace(regEx, position.toString());
        return this.http.put(url, JSON.stringify(""), this.baseService.getHeaders())
             .map(res => res.json());
    }

    setGroupOnTable(groupId: number, tableNumber:number):Observable<any>{
        let regEx = new RegExp("groupId");
        let url = this.addGroupToTableUrl.replace(regEx, groupId.toString());
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