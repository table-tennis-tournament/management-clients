import { Mock } from 'vitest';
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
  let toast: { error: Mock; success: Mock; info: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
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
      const load = vi.spyOn(settingsService, 'loadSettings').mockReturnValue(of(settingsTestData));

      const result = await emittedBy(settingsEffects.loadSettings, actions, new LoadSettings());

      expect(result).toStrictEqual([new LoadSettingsSuccess(settingsTestData)]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadSettingsError and show an error', async () => {
      vi.spyOn(settingsService, 'loadSettings').mockReturnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.loadSettings, actions, new LoadSettings());

      expect(result).toStrictEqual([new LoadSettingsError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Settings']]);
    });
  });

  describe('loadPrinters', () => {
    it('should return a LoadPrintersSuccess', async () => {
      const printers = ['firstPrinter', 'secondPrinter'];
      const load = vi.spyOn(settingsService, 'loadPrinters').mockReturnValue(of(printers));

      const result = await emittedBy(settingsEffects.loadPrinters, actions, new LoadPrinters());

      expect(result).toStrictEqual([new LoadPrintersSuccess(printers)]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadPrintersError and show an error', async () => {
      vi.spyOn(settingsService, 'loadPrinters').mockReturnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.loadPrinters, actions, new LoadPrinters());

      expect(result).toStrictEqual([new LoadPrintersError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Drucker']]);
    });
  });

  describe('saveAssignAutomatically', () => {
    it('should return a SaveAssignAutomaticallySuccess', async () => {
      const save = vi.spyOn(settingsService, 'saveAssignAutomatically').mockReturnValue(of(status));

      const result = await emittedBy(
        settingsEffects.saveAssignAutomatically,
        actions,
        new SaveAssignAutomatically(true)
      );

      expect(result).toStrictEqual([new SaveAssignAutomaticallySuccess(true)]);
      expect(save.mock.calls).toEqual([[true]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a SaveAssignAutomaticallyError and show an error', async () => {
      vi.spyOn(settingsService, 'saveAssignAutomatically').mockReturnValue(throwError(() => error));

      const result = await emittedBy(
        settingsEffects.saveAssignAutomatically,
        actions,
        new SaveAssignAutomatically(true)
      );

      expect(result).toStrictEqual([new SaveAssignAutomaticallyError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Speichern des automatischen zuweisens']]);
    });
  });

  describe('savePrintOnAssign', () => {
    it('should return a SavePrintOnAssignSuccess', async () => {
      const save = vi.spyOn(settingsService, 'savePrintOnAssign').mockReturnValue(of(status));

      const result = await emittedBy(settingsEffects.savePrintOnAssign, actions, new SavePrintOnAssign(true));

      expect(result).toStrictEqual([new SavePrintOnAssignSuccess(true)]);
      expect(save.mock.calls).toEqual([[true]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a SavePrintOnAssignError and show an error', async () => {
      vi.spyOn(settingsService, 'savePrintOnAssign').mockReturnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.savePrintOnAssign, actions, new SavePrintOnAssign(false));

      expect(result).toStrictEqual([new SavePrintOnAssignError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Speichern des druckens bei aufruf']]);
    });
  });

  describe('setPrinter', () => {
    it('should return a SetPrinterSuccess', async () => {
      const set = vi.spyOn(settingsService, 'setPrinter').mockReturnValue(of(status));

      const result = await emittedBy(settingsEffects.setPrinter, actions, new SetPrinter('printerName'));

      expect(result).toStrictEqual([new SetPrinterSuccess('printerName')]);
      expect(set.mock.calls).toEqual([['printerName']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a SetPrinterError and show an error', async () => {
      vi.spyOn(settingsService, 'setPrinter').mockReturnValue(throwError(() => error));

      const result = await emittedBy(settingsEffects.setPrinter, actions, new SetPrinter('printerName'));

      expect(result).toStrictEqual([new SetPrinterError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim setzen des Druckers']]);
    });
  });
});
