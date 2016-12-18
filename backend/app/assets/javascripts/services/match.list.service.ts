import {Match} from "../data/match"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";


@Injectable()
export class MatchListService {
    private nextMatchUrl = "matchlist/next";
    private allMatchListUrl = "matchlist/all";

    constructor(private http: Http){}

    getNextMatch(): Observable<Match>{
        return this.http.get(this.nextMatchUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
    }

    getCompleteMatchlist(): Observable<Match[]>{
        return this.http.get(this.allMatchListUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
    }
}