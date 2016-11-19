import {Match} from "../data/match"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";

@Injectable()
export class MatchService {
  private allMatchesUrl = "match/all";

  constructor(private http: Http){}

  getAllMatches(): Observable<Match[]>{
    return this.http.get(this.allMatchesUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
