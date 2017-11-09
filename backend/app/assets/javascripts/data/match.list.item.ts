export class MatchListItem {

    constructor(matchId: number[]){
        this.matchIds = matchId;
    }
    position: number;
    id: string;
    matchIds: number[];
    group: number;
}