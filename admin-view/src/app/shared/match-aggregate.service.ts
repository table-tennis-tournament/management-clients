import {Injectable} from '@angular/core';
import {Match} from './data/match.model';
import {MatchAggregate} from './data/match.aggregate';
import {Player} from './data/player.model';

@Injectable({
    providedIn: 'root'
})
export class MatchAggregateService {

    constructor() {
    }

    getMatchAggregateForMatches(matches: Match[]): MatchAggregate[] {
        const groupMatches = matches.filter(match => match.group != null);
        const stageMatches = matches.filter(match => match.group == null);
        const result = [];
        stageMatches.forEach(match => {
            result.push(this.createNewGroupAggregate(match, match.matchType.name));
        });
        const groupMatchesAggregate = new Map();
        groupMatches.forEach(match => {
            const key = this.getKeyForGroupMatch(match);
            if (groupMatchesAggregate.has(key) === false) {
                groupMatchesAggregate.set(key, this.createNewGroupAggregate(match, `Gruppe ${match.group.name}`));
                return;
            }
            const currentItem = groupMatchesAggregate.get(key);
            currentItem.players = this.getDistinctedPlayers(currentItem.players, match.team1.concat(match.team2));
            currentItem.matches.push(match);
        });
        return result.concat(Array.from(groupMatchesAggregate.values()));
    }

    private getKeyForGroupMatch(match: Match) {
        return match.type.name + match.group.name;
    }

    private createNewGroupAggregate(match: Match, name: string): MatchAggregate {
        return {
            name: name,
            discipline: match.type,
            matches: [match],
            players: match.team1.concat(match.team2),
            tableNumbers: match.table
        };
    }

    private getDistinctedPlayers(currentPlayers: Player[], playersToAdd: Player[]): Player[] {
        const result = [];
        [...currentPlayers, ...playersToAdd].forEach(player => {
                if (!result[player.id]) {
                    result[player.id] = player;
                }
            }
        );
        return result.filter(player => player);
    }
}
