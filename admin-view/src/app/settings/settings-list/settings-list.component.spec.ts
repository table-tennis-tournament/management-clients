import { SettingsListComponent } from './settings-list.component';

describe('the settings list', () => {
  let list: SettingsListComponent;
  let emitted: Record<string, unknown[]>;

  beforeEach(() => {
    list = new SettingsListComponent();
    emitted = { saveTypeColor: [], setBulkTypeColors: [], saveShortName: [] };
    list.saveTypeColor.subscribe((value) => emitted['saveTypeColor'].push(value));
    list.setBulkTypeColors.subscribe((value) => emitted['setBulkTypeColors'].push(value));
    list.saveShortName.subscribe((value) => emitted['saveShortName'].push(value));
  });

  it('reads the printer, printing on assign and assigning automatically from the settings', () => {
    list.settings = [
      { key: 'printerName', value: 'Brother' },
      { key: 'alwaysPrint', value: true },
      { key: 'autoStart', value: false },
      { key: 'unknown', value: 'ignored' },
    ];

    expect([list.selectedPrinter, list.isPrintForAssign, list.assignAutomatically]).toEqual(['Brother', true, false]);
  });

  describe('the colors of a discipline', () => {
    beforeEach(() => {
      list.typeColors = { 2: { bgColor: '#00ff00', textColor: 'black' } };
    });

    it('shows the colors of the selected discipline', () => {
      list.selectedTypeId = 2;
      list.onTypeSelected();

      expect([list.selectedBgColor, list.selectedTextColor]).toEqual(['#00ff00', 'black']);
    });

    it('offers red on white for a discipline without colors', () => {
      list.selectedTypeId = 3;
      list.onTypeSelected();

      expect([list.selectedBgColor, list.selectedTextColor]).toEqual(['#FF0000', 'white']);
    });

    it('updates the shown colors when the saved colors change', () => {
      list.selectedTypeId = 2;
      list.typeColors = { 2: { bgColor: '#0000ff', textColor: 'white' } };

      expect([list.selectedBgColor, list.selectedTextColor]).toEqual(['#0000ff', 'white']);
    });

    it('saves the colors of the selected discipline', () => {
      list.selectedTypeId = 2;
      list.selectedBgColor = '#123ABC';
      list.selectedTextColor = 'black';

      list.saveTypeColorClick();

      expect(emitted['saveTypeColor']).toEqual([{ typeId: 2, colorData: { bgColor: '#123ABC', textColor: 'black' } }]);
    });

    it('rejects a background color that is not #RRGGBB', () => {
      const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
      list.selectedTypeId = 2;
      list.selectedBgColor = 'red';

      list.saveTypeColorClick();

      expect(emitted['saveTypeColor']).toEqual([]);
      expect(alert.mock.calls).toEqual([['Ungültiges Farbformat. Bitte verwenden Sie #RRGGBB']]);
    });

    it('saves nothing without a selected discipline', () => {
      list.saveTypeColorClick();

      expect(emitted['saveTypeColor']).toEqual([]);
    });

    it('sets the Saturday and the Sunday colors of every discipline at once', () => {
      list.setSaturdayColors();
      list.setSundayColors();

      const [saturday, sunday] = emitted['setBulkTypeColors'] as Record<number, unknown>[];
      expect([Object.keys(saturday).length, Object.keys(sunday).length]).toEqual([20, 10]);
      expect([saturday[1], sunday[1]]).toEqual([
        { bgColor: '#959595', textColor: 'white' },
        { bgColor: '#e3980f', textColor: 'white' },
      ]);
    });
  });

  describe('the short names', () => {
    beforeEach(() => {
      list.shortNames = { 2: 'J18 B' };
    });

    it('starts the drafts with the saved short names', () => {
      expect(list.shortNameDrafts).toEqual({ 2: 'J18 B' });
      expect(list.shortNameDrafts).not.toBe(list.shortNames);
    });

    it('offers saving only a changed short name, ignoring surrounding spaces', () => {
      expect([list.isShortNameChanged(2), list.isShortNameChanged(3)]).toEqual([false, false]);

      list.shortNameDrafts[2] = ' J18 B ';
      list.shortNameDrafts[3] = 'M15';

      expect([list.isShortNameChanged(2), list.isShortNameChanged(3)]).toEqual([false, true]);
    });

    it('offers removing a short name by clearing it', () => {
      list.shortNameDrafts[2] = '';

      expect(list.isShortNameChanged(2)).toBe(true);
    });

    it('saves the trimmed draft, and a blank one to remove the short name', () => {
      list.shortNameDrafts[3] = '  M15 ';
      list.saveShortNameClick(3);
      list.saveShortNameClick(4);

      expect(emitted['saveShortName']).toEqual([
        { typeId: 3, shortName: 'M15' },
        { typeId: 4, shortName: '' },
      ]);
    });

    it('drops unsaved drafts when the saved short names arrive again', () => {
      list.shortNameDrafts[3] = 'typed';
      list.shortNames = { 2: 'J18 B', 5: 'S' };

      expect(list.shortNameDrafts).toEqual({ 2: 'J18 B', 5: 'S' });
    });

    it('copes with short names that are not loaded yet', () => {
      list.shortNames = null;

      expect([list.shortNames, list.shortNameDrafts, list.isShortNameChanged(2)]).toEqual([{}, {}, false]);
    });
  });
});
