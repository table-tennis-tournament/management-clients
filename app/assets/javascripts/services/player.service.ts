import {Player} from "../data/player"
import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx";

@Injectable()
export class PlayerService {
  private playerUrl = "player/all";

  constructor(private http: Http){}

  getPlayers() {
    var staticPlayers: Player[] = [];
      // {"id": 11, "firstName": "Kian", "lastName": "Aragian", "ttr":1660,  "sex":"m", club:new Club("")},
      // {"id": 12, "firstName": "Benjamin", "lastName": "Bauermeister", "ttr":1660, "sex":"m"},
      // {"id": 13, "firstName": "Sebastian", "lastName": "Sakmann", "ttr":1660, "sex":"m"},
      // {"id": 14, "firstName": "Rainald", "lastName": "Knaup", "ttr":1660, "sex":"m"},
      // {"id": 15, "firstName": "Jonas", "lastName": "Fürst", "ttr":1660,  "sex":"m"}

      // ];
    return staticPlayers;
  }

  getAllPlayers(): Observable<Player[]>{
    return this.http.get(this.playerUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
