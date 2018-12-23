import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, ReplaySubject, throwError} from 'rxjs';

import {IndividualConfig, ToastrService} from 'ngx-toastr';
import {SettingsEffects} from './settings.effects';
import {SettingsService} from '../settings.service';
import {
    LoadPrinters,
    LoadPrintersSuccess,
    LoadSettings,
    LoadSettingsSuccess,
    SaveAssignAutomatically,
    SaveAssignAutomaticallySuccess,
    SavePrintOnAssign,
    SavePrintOnAssignSuccess,
    SetPrinter,
    SetPrinterSuccess,
    SettingsActionTypes
} from './settings.actions';
import {settingsTestData} from './test.data';

describe('the settings effects', () => {
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

            actions.next(new LoadSettings());

            settingsEffects.loadSettings$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadSettingsError', (done) => {
            spyOn(settingsService, 'loadSettings').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadSettings());

            settingsEffects.loadSettings$.subscribe((result) => {
                expect(result.type).toEqual(SettingsActionTypes.LoadError);
                done();
            });
        });


    });

    describe('loadPrinters', () => {

        it('should return a LoadPrintersSuccess', (done) => {
            const printers = ['firstPrinter', 'secondPrinter'];
            const expectedResult = new LoadPrintersSuccess(printers);
            spyOn(settingsService, 'loadPrinters').and.returnValue(of(printers));

            actions.next(new LoadPrinters());

            settingsEffects.loadPrinters$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadPrintersError', (done) => {
            spyOn(settingsService, 'loadPrinters').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadPrinters());

            settingsEffects.loadPrinters$.subscribe((result) => {
                expect(result.type).toEqual(SettingsActionTypes.LoadPrintersError);
                done();
            });
        });


    });

    describe('saveAssignAutomatically', () => {

        it('should return a SaveAssignAutomaticallySuccess', (done) => {
            const expectedState = {successful: true};
            const expectedResult = new SaveAssignAutomaticallySuccess(true);
            spyOn(settingsService, 'saveAssignAutomatically').and.returnValue(of(expectedState));

            actions.next(new SaveAssignAutomatically(true));

            settingsEffects.saveAssignAutomatically$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a SaveAssignAutomaticallyError', (done) => {
            spyOn(settingsService, 'saveAssignAutomatically').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new SaveAssignAutomatically(true));

            settingsEffects.saveAssignAutomatically$.subscribe((result) => {
                expect(result.type).toEqual(SettingsActionTypes.SaveAssignAutomaticallyError);
                done();
            });
        });


    });

    describe('savePrintOnAssign', () => {

        it('should return a SavePrintOnAssignSuccess', (done) => {
            const expectedState = {successful: true};
            const expectedResult = new SavePrintOnAssignSuccess(true);
            spyOn(settingsService, 'savePrintOnAssign').and.returnValue(of(expectedState));

            actions.next(new SavePrintOnAssign(true));

            settingsEffects.savePrintOnAssign$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a SavePrintOnAssignError', (done) => {
            spyOn(settingsService, 'savePrintOnAssign').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new SavePrintOnAssign(false));

            settingsEffects.savePrintOnAssign$.subscribe((result) => {
                expect(result.type).toEqual(SettingsActionTypes.SavePrintOnAssignError);
                done();
            });
        });


    });

    describe('setPrinter', () => {

        it('should return a SetPrinterSuccess', (done) => {
            const expectedState = {successful: true};
            const printerName = 'printerName';
            const expectedResult = new SetPrinterSuccess(printerName);
            spyOn(settingsService, 'setPrinter').and.returnValue(of(expectedState));

            actions.next(new SetPrinter(printerName));

            settingsEffects.setPrinter$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a SetPrinterError', (done) => {
            spyOn(settingsService, 'setPrinter').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new SetPrinter('printerName'));

            settingsEffects.setPrinter$.subscribe((result) => {
                expect(result.type).toEqual(SettingsActionTypes.SetPrinterError);
                done();
            });
        });


    });

});
