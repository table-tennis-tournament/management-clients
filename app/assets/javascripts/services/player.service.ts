import {Player} from "../data/player"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx"

@Injectable()
export class PlayerService {
  private playerUrl = "player/all";

  constructor(private http: Http){}


  getAllPlayers(): Observable<Player[]>{
    return this.http.get(this.playerUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
