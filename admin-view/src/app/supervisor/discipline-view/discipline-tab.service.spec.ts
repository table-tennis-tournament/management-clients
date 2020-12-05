import {inject, TestBed} from '@angular/core/testing';

import {DisciplineTabService} from './discipline-tab.service';
import {TenDisciplines, ThreeMatches} from '../../shared/data/match.test.data';

describe('DisciplineTabService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DisciplineTabService]
        });
    });

    it('should create two tabs for testdata', inject([DisciplineTabService], (service: DisciplineTabService) => {
        const result = service.getTabForMatches(ThreeMatches);
        expect(result.groups.length).toEqual(1);
        expect(result.stages.length).toEqual(0);
    }));

    it('should create eight tabs for testdata', inject([DisciplineTabService], (service: DisciplineTabService) => {
        const result = service.getTabsForDisciplines(TenDisciplines);
        expect(10).toEqual(result.length);
    }));

    it('should create two tabs for completeData', inject([DisciplineTabService], (service: DisciplineTabService) => {
        const completeGroup = ThreeMatches.map(match => match);
        completeGroup.forEach(match => match.result = [
            [
                11,
                5
            ],
            [
                11,
                5
            ],
            [
                11,
                5
            ]
        ]);
        const result = service.getTabForMatches(completeGroup);
        expect(result.groups.length).toEqual(1);
        expect(result.stages.length).toEqual(0);
    }));
});
