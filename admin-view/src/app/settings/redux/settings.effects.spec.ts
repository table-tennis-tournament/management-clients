import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { SettingsEffects } from './settings.effects';
import { SettingsService } from '../settings.service';
import {
  LoadPrinters,
  LoadPrintersError,
  LoadPrintersSuccess,
  LoadSettings,
  LoadSettingsError,
  LoadSettingsSuccess,
  SaveAssignAutomatically,
  SaveAssignAutomaticallyError,
  SaveAssignAutomaticallySuccess,
  SavePrintOnAssign,
  SavePrintOnAssignError,
  SavePrintOnAssignSuccess,
  SetPrinter,
  SetPrinterError,
  SetPrinterSuccess,
} from './settings.actions';
import { settingsTestData } from './test.data';

describe('the settings effects', () => {
  const error = { msg: 'Error' };
  const status = { success: true };
  let actions: ReplaySubject<any>;
  let settingsEffects: SettingsEffects;
  let settingsService: SettingsService;
  let toast: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = jasmine.createSpyObj('ToastrService', ['error', 'success', 'info']);
    TestBed.configureTestingModule({
      providers: [
        SettingsEffects,
        SettingsService,
        { provide: ToastrService, useValue: toast },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });
    settingsService = TestBed.inject(SettingsService);
    settingsEffects = TestBed.inject(SettingsEffects);
  });

  describe('loadSettings', () => {
    it('should return a LoadSettingsSuccess', async () => {
      const load = spyOn(settingsService, 'loadSettings').and.returnValue(of(settingsTestData));

      const result = await emittedBy(settingsEffects.loadSettings, actions, new LoadSettings());

      expect(result).toEqual([new LoadSettingsSuccess(settingsTestData)]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadSettingsError and show an error', async () => {
      spyOn(settingsService, 'loadSettings').and.returnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.loadSettings, actions, new LoadSettings());

      expect(result).toEqual([new LoadSettingsError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Settings']]);
    });
  });

  describe('loadPrinters', () => {
    it('should return a LoadPrintersSuccess', async () => {
      const printers = ['firstPrinter', 'secondPrinter'];
      const load = spyOn(settingsService, 'loadPrinters').and.returnValue(of(printers));

      const result = await emittedBy(settingsEffects.loadPrinters, actions, new LoadPrinters());

      expect(result).toEqual([new LoadPrintersSuccess(printers)]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadPrintersError and show an error', async () => {
      spyOn(settingsService, 'loadPrinters').and.returnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.loadPrinters, actions, new LoadPrinters());

      expect(result).toEqual([new LoadPrintersError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Drucker']]);
    });
  });

  describe('saveAssignAutomatically', () => {
    it('should return a SaveAssignAutomaticallySuccess', async () => {
      const save = spyOn(settingsService, 'saveAssignAutomatically').and.returnValue(of(status));

      const result = await emittedBy(
        settingsEffects.saveAssignAutomatically,
        actions,
        new SaveAssignAutomatically(true)
      );

      expect(result).toEqual([new SaveAssignAutomaticallySuccess(true)]);
      expect(save.calls.allArgs()).toEqual([[true]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a SaveAssignAutomaticallyError and show an error', async () => {
      spyOn(settingsService, 'saveAssignAutomatically').and.returnValue(throwError(() => error));

      const result = await emittedBy(
        settingsEffects.saveAssignAutomatically,
        actions,
        new SaveAssignAutomatically(true)
      );

      expect(result).toEqual([new SaveAssignAutomaticallyError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Speichern des automatischen zuweisens']]);
    });
  });

  describe('savePrintOnAssign', () => {
    it('should return a SavePrintOnAssignSuccess', async () => {
      const save = spyOn(settingsService, 'savePrintOnAssign').and.returnValue(of(status));

      const result = await emittedBy(settingsEffects.savePrintOnAssign, actions, new SavePrintOnAssign(true));

      expect(result).toEqual([new SavePrintOnAssignSuccess(true)]);
      expect(save.calls.allArgs()).toEqual([[true]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a SavePrintOnAssignError and show an error', async () => {
      spyOn(settingsService, 'savePrintOnAssign').and.returnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.savePrintOnAssign, actions, new SavePrintOnAssign(false));

      expect(result).toEqual([new SavePrintOnAssignError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Speichern des druckens bei aufruf']]);
    });
  });

  describe('setPrinter', () => {
    it('should return a SetPrinterSuccess', async () => {
      const set = spyOn(settingsService, 'setPrinter').and.returnValue(of(status));

      const result = await emittedBy(settingsEffects.setPrinter, actions, new SetPrinter('printerName'));

      expect(result).toEqual([new SetPrinterSuccess('printerName')]);
      expect(set.calls.allArgs()).toEqual([['printerName']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a SetPrinterError and show an error', async () => {
      spyOn(settingsService, 'setPrinter').and.returnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.setPrinter, actions, new SetPrinter('printerName'));

      expect(result).toEqual([new SetPrinterError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim setzen des Druckers']]);
    });
  });
});
