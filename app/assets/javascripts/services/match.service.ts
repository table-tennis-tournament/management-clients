import {Match} from "../data/match"
import {IResult} from "../data/result"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";

@Injectable()
export class MatchService {
  private allMatchesUrl = "match/all";
  private addResultString = "match/matchId/result";
    private nextMatchUrl = "matches/next";

  constructor(private http: Http){}

  getAllMatches(): Observable<Match[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  addResult(resultToHandle: IResult[], matchId: number){
    var regEx = new RegExp("matchId");
    var url = this.addResultString.replace(regEx, matchId.toString());
    console.log("before http post: " + url)
    return this.http.post(url, resultToHandle).catch((error:any) => Observable.throw(error.json().error || "Server error"));;
  }

  getNextMatch(): Observable<Match>{
        return this.http.get(this.nextMatchUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
