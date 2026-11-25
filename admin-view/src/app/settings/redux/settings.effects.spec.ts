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
  LoadTypeColors,
  LoadTypeColorsError,
  LoadTypeColorsSuccess,
  SaveTypeColor,
  SaveTypeColorError,
  SaveTypeColorSuccess,
  SetBulkTypeColors,
  SetBulkTypeColorsError,
  SetBulkTypeColorsSuccess,
  LoadShortNames,
  LoadShortNamesError,
  LoadShortNamesSuccess,
  SaveShortName,
  SaveShortNameError,
  SaveShortNameSuccess,
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

  describe('the discipline colors', () => {
    const colors = { 1: { bgColor: '#ff0000', textColor: 'white' } };
    const saved = { typeId: 1, colorData: colors[1] };

    it('loads them', async () => {
      const load = vi.spyOn(settingsService, 'loadTypeColors').mockReturnValue(of(colors));

      expect(await emittedBy(settingsEffects.loadTypeColors, actions, new LoadTypeColors())).toStrictEqual([
        new LoadTypeColorsSuccess(colors),
      ]);
      expect(load.mock.calls).toEqual([[]]);
    });

    it('shows an error when they do not load', async () => {
      vi.spyOn(settingsService, 'loadTypeColors').mockReturnValue(throwError(() => error));

      expect(await emittedBy(settingsEffects.loadTypeColors, actions, new LoadTypeColors())).toStrictEqual([
        new LoadTypeColorsError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Type-Farben']]);
    });

    it('saves the colors of one discipline and confirms it', async () => {
      const save = vi.spyOn(settingsService, 'saveTypeColor').mockReturnValue(of(status));

      expect(await emittedBy(settingsEffects.saveTypeColor, actions, new SaveTypeColor(saved))).toStrictEqual([
        new SaveTypeColorSuccess(saved),
      ]);
      expect(save.mock.calls).toEqual([[1, colors[1]]]);
      expect(toast.success.mock.calls).toEqual([['Type-Farbe gespeichert']]);
    });

    it('shows an error when saving the colors of one discipline fails', async () => {
      vi.spyOn(settingsService, 'saveTypeColor').mockReturnValue(throwError(() => error));

      expect(await emittedBy(settingsEffects.saveTypeColor, actions, new SaveTypeColor(saved))).toStrictEqual([
        new SaveTypeColorError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Speichern der Type-Farbe']]);
    });

    it('sets the colors of several disciplines and confirms it', async () => {
      const set = vi.spyOn(settingsService, 'setBulkTypeColors').mockReturnValue(of(status));

      expect(await emittedBy(settingsEffects.setBulkTypeColors, actions, new SetBulkTypeColors(colors))).toStrictEqual([
        new SetBulkTypeColorsSuccess(colors),
      ]);
      expect(set.mock.calls).toEqual([[colors]]);
      expect(toast.success.mock.calls).toEqual([['Type-Farben erfolgreich gesetzt']]);
    });

    it('shows an error when setting the colors of several disciplines fails', async () => {
      vi.spyOn(settingsService, 'setBulkTypeColors').mockReturnValue(throwError(() => error));

      expect(await emittedBy(settingsEffects.setBulkTypeColors, actions, new SetBulkTypeColors(colors))).toStrictEqual([
        new SetBulkTypeColorsError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Setzen der Type-Farben']]);
    });
  });

  describe('the discipline short names', () => {
    const shortName = { typeId: 2, shortName: 'J18 B' };

    it('loads them', async () => {
      const load = vi.spyOn(settingsService, 'loadShortNames').mockReturnValue(of({ 2: 'J18 B' }));

      expect(await emittedBy(settingsEffects.loadShortNames, actions, new LoadShortNames())).toStrictEqual([
        new LoadShortNamesSuccess({ 2: 'J18 B' }),
      ]);
      expect(load.mock.calls).toEqual([[]]);
    });

    it('shows an error when they do not load', async () => {
      vi.spyOn(settingsService, 'loadShortNames').mockReturnValue(throwError(() => error));

      expect(await emittedBy(settingsEffects.loadShortNames, actions, new LoadShortNames())).toStrictEqual([
        new LoadShortNamesError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Kurznamen']]);
    });

    it('saves a short name and confirms it', async () => {
      const save = vi.spyOn(settingsService, 'saveShortName').mockReturnValue(of(status));

      expect(await emittedBy(settingsEffects.saveShortName, actions, new SaveShortName(shortName))).toStrictEqual([
        new SaveShortNameSuccess(shortName),
      ]);
      expect(save.mock.calls).toEqual([[2, 'J18 B']]);
      expect(toast.success.mock.calls).toEqual([['Kurzname gespeichert']]);
    });

    it('keeps the short name unsaved when the backend rejects it, e.g. for being too long', async () => {
      const rejected = { success: false };
      vi.spyOn(settingsService, 'saveShortName').mockReturnValue(of(rejected));

      expect(await emittedBy(settingsEffects.saveShortName, actions, new SaveShortName(shortName))).toStrictEqual([
        new SaveShortNameError(rejected),
      ]);
      expect(toast.error.mock.calls).toEqual([['Kurzname nicht gespeichert (höchstens 30 Zeichen)']]);
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('shows an error when saving a short name fails', async () => {
      vi.spyOn(settingsService, 'saveShortName').mockReturnValue(throwError(() => error));

      expect(await emittedBy(settingsEffects.saveShortName, actions, new SaveShortName(shortName))).toStrictEqual([
        new SaveShortNameError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Speichern des Kurznamens']]);
    });
  });
});
