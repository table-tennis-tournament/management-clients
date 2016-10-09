import {Player} from './data/player';
import {PLAYERS} from './mock-heroes';
import {Injectable} from 'angular2/core';

@Injectable()
export class HeroService {
  getHeroes() {
    var PLAYERS: Player[] = [
      {"id": 11, "firstName": "Kian", "lastName": "Aragian", "ttr":1660, "club":"TTV Ettlingen"},
      {"id": 12, "firstName": "Kian", "lastName": "Aragian", "ttr":1660, "club":"TTV Ettlingen"},
      {"id": 13, "firstName": "Kian", "lastName": "Aragian", "ttr":1660, "club":"TTV Ettlingen"},
      {"id": 14, "firstName": "Kian", "lastName": "Aragian", "ttr":1660, "club":"TTV Ettlingen"},
      {"id": 15, "firstName": "Kian", "lastName": "Aragian", "ttr":1660, "club":"TTV Ettlingen"}

      ];
    return PLAYERS;
  }

}
