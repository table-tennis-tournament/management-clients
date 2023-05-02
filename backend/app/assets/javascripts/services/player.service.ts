import {Player} from "../data/player"
import {Injectable} from "@angular/core"
import {Headers, Http } from "@angular/http"

@Injectable()
export class PlayerService {
  private playerUrl = "getAllPlayer";

  constructor(private http: Http){}

  getPlayers() {
    var PLAYERS: Player[] = [
      {"id": 11, "firstName": "Kian", "lastName": "Aragian", "ttr":1660,  "sex":"m"},
      {"id": 12, "firstName": "Benjamin", "lastName": "Bauermeister", "ttr":1660, "sex":"m"},
      {"id": 13, "firstName": "Sebastian", "lastName": "Sakmann", "ttr":1660, "sex":"m"},
      {"id": 14, "firstName": "Rainald", "lastName": "Knaup", "ttr":1660, "sex":"m"},
      {"id": 15, "firstName": "Jonas", "lastName": "Fürst", "ttr":1660,  "sex":"m"}

      ];
    return PLAYERS;
  }

}
