import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, ReplaySubject, throwError} from 'rxjs';

import {IndividualConfig, ToastrService} from 'ngx-toastr';
import {SettingsEffects} from './settings.effects';
import {SettingsService} from '../settings.service';
import {LoadSettings, LoadSettingsSuccess, SettingsActionTypes} from './settings.actions';
import {settingsTestData} from './test.data';

describe('the match effects', () => {
    let actions: ReplaySubject<any>;
    let settingsEffects: SettingsEffects;
    let settingsService: SettingsService;

    const toastServiceMock: ToastrService = <ToastrService>{
        error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null
    };

    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                SettingsEffects,
                SettingsService,
                {provide: ToastrService, useValue: toastServiceMock},
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });
        settingsService = TestBed.get(SettingsService);
        settingsEffects = TestBed.get(SettingsEffects);
    });

    describe('loadSettings', () => {

        it('should return a LoadSettingsSuccess', (done) => {
            const expectedResult = new LoadSettingsSuccess(settingsTestData);
            spyOn(settingsService, 'loadSettings').and.returnValue(of(settingsTestData));

            actions.next(new LoadSettings(null));

            settingsEffects.loadSettings$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadSettingsError', (done) => {
            spyOn(settingsService, 'loadSettings').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadSettings(null));

            settingsEffects.loadSettings$.subscribe((result) => {
                expect(result.type).toEqual(SettingsActionTypes.LoadError);
                done();
            });
        });


    });

});
