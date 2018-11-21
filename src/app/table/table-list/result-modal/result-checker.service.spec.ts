import {inject, TestBed} from '@angular/core/testing';

import {ResultCheckerService} from './result-checker.service';
import {TTResult} from './ttresult.model';

describe('ResultCheckerService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ResultCheckerService]
        });
    });

    it('first player winning', inject([ResultCheckerService], (service: ResultCheckerService) => {
        const expectedResult: TTResult[] = [[11, 3], [11, 4], [11, 5]];

        const result = service.checkResult('3 4 5');
        expect(result.firstPlayerWinning).toEqual(true);
        expect(result.secondPlayerWinning).toEqual(false);
        expect(result.currentResult).toEqual(expectedResult);
    }));


    it('second player winning', inject([ResultCheckerService], (service: ResultCheckerService) => {
        const expectedResult: TTResult[] = [[3, 11], [11, 4], [5, 11], [6, 11]];

        const result = service.checkResult('-3 4 -5 -6');
        expect(result.firstPlayerWinning).toEqual(false);
        expect(result.secondPlayerWinning).toEqual(true);
        expect(result.currentResult).toEqual(expectedResult);
    }));

    it('second player winning in five', inject([ResultCheckerService], (service: ResultCheckerService) => {
        const expectedResult: TTResult[] = [[3, 11], [11, 4], [5, 11], [11, 6], [5, 11]];

        const result = service.checkResult('-3 4 -5 6 -5');
        expect(result.firstPlayerWinning).toEqual(false);
        expect(result.secondPlayerWinning).toEqual(true);
        expect(result.currentResult).toEqual(expectedResult);
    }));

    it('second player is winning with different signs', inject([ResultCheckerService], (service: ResultCheckerService) => {
        const expectedResult: TTResult[] = [[3, 11], [11, 4], [5, 11], [11, 6], [5, 11]];

        const result = service.checkResult('-3 4 -5 6 -5');
        expect(result.firstPlayerWinning).toEqual(false);
        expect(result.secondPlayerWinning).toEqual(true);
        expect(result.currentResult).toEqual(expectedResult);
    }));
});
