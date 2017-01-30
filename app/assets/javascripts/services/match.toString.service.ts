import {Match} from "../data/match"
import {Player} from "../data/player"
import {Club} from "../data/club"
import {Injectable} from "@angular/core"

@Injectable()
export class MatchToStringService {
  
  getPlayersNamesLong(players: Player[]): string{
    if(players === null || players.length === 0){
        return "";
    }
    if(players.length === 1){
        return this.getSinglePlayerString(players[0]);
    }
    if(players.length === 2){
        return this.getSinglePlayerStringShort(players[0]) + "/"+
            this.getSinglePlayerStringShort(players[1]) ;
    }
    return "";
  }

  getSinglePlayerString(player: Player){
      return player.firstName + " " + player.lastName + "("+player.club.clubName + ")";
  }

  getSinglePlayerStringShort(player: Player){
      return player.firstName.substr(0, 2) + ". " + player.lastName;
  }

}