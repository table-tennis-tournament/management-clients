import {MatchDto} from "../data/match.dto"
import {IResult} from "../data/result"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";

@Injectable()
export class MatchService {
  private allMatchesUrl = "match/all";
  private addResultString = "match/matchId/result";

  constructor(private http: Http){}

  getAllMatches(): Observable<MatchDto[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  addResult(resultToHandle: IResult[], matchId: number){
    var regEx = new RegExp("matchId");
    var url = this.addResultString.replace(regEx, matchId.toString());
    console.log("before http post: " + url)
    return this.http.post(url, resultToHandle);
  }

 

}
