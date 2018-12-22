import {inject, TestBed} from '@angular/core/testing';

import {MatchAggregateService} from './match-aggregate.service';
import {oneMatch, ThreeMatches} from './data/match.test.data';


describe('MatchAggregateService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MatchAggregateService]
        });
    });

    it('should return an empty array if there are not matches', inject([MatchAggregateService], (service: MatchAggregateService) => {
        const result = service.getMatchAggregateForMatches([]);
        expect(0).toEqual(result.length);
        expect([]).toEqual(result);
    }));

    it('should return one result for one group match', inject([MatchAggregateService], (service: MatchAggregateService) => {
        const result = service.getMatchAggregateForMatches([oneMatch]);
        expect(1).toEqual(result.length);
        expect('Gruppe 01').toEqual(result[0].name);
        expect([oneMatch]).toEqual(result[0].matches);
        expect(oneMatch.table).toEqual(result[0].tableNumbers);
        expect(oneMatch.type).toEqual(result[0].discipline);
    }));

    it('should return one result for one stage match', inject([MatchAggregateService], (service: MatchAggregateService) => {
        const newResult = Object.assign({}, oneMatch);
        newResult.group = null;
        newResult.matchType.name = 'Achtelfinale';
        const result = service.getMatchAggregateForMatches([newResult]);
        expect(1).toEqual(result.length);
        expect(newResult.matchType.name).toEqual(result[0].name);
    }));
    it('should return two result for two matches', inject([MatchAggregateService], (service: MatchAggregateService) => {
        const newResult = Object.assign({}, oneMatch);
        newResult.group = null;
        newResult.matchType.name = 'Achtelfinale';
        const result = service.getMatchAggregateForMatches([newResult, oneMatch]);
        expect(2).toEqual(result.length);
        expect(newResult.matchType.name).toEqual(result[0].name);
        expect('Gruppe 01').toEqual(result[1].name);
    }));

    it('should return two result for three matches', inject([MatchAggregateService], (service: MatchAggregateService) => {
        const secondMatch = Object.assign({}, oneMatch);
        secondMatch.group = null;
        secondMatch.matchType.name = 'Achtelfinale';
        const matchesToTest = ThreeMatches.concat(secondMatch);
        const result = service.getMatchAggregateForMatches(matchesToTest);
        expect(2).toEqual(result.length);
        expect(secondMatch.matchType.name).toEqual(result[0].name);
        expect('Gruppe 01 ').toEqual(result[1].name);
        expect(3).toEqual(result[1].players.length);
    }));
});
