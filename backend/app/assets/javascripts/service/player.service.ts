import {Player} from '../data/player';
import {Injectable} from '@angular/core';
import { Headers, Http } from '@angular/http';
import {Promise} from 'es6-promise';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class PlayerService {
  private playerUrl = 'getAllPlayer';

  constructor(private http: Http){}

  getPlayers() {
    var PLAYERS: Player[] = [
      {"id": 11, "firstName": "Kian", "lastName": "Aragian", "ttr":1660, paid: true, sex:'m'},
      {"id": 12, "firstName": "Benjamin", "lastName": "Bauermeister", "ttr":1660, paid: true, sex:'m'},
      {"id": 13, "firstName": "Sebastian", "lastName": "Sakmann", "ttr":1660, paid: true, sex:'m'},
      {"id": 14, "firstName": "Rainald", "lastName": "Knaup", "ttr":1660, paid: true, sex:'m'},
      {"id": 15, "firstName": "Jonas", "lastName": "Fürst", "ttr":1660, paid: true, sex:'m'}

      ];
    return PLAYERS;
  }

  getAllPlayers(): Promise<Player[]>{
    return this.http.get(this.playerUrl)
               .toPromise()
               .then(response => {
                 console.log(response.json());
                 return response.json() as Player[];
                })
               .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
