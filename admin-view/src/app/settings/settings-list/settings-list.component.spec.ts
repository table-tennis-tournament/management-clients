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

    it('shows the saved colors of a discipline, and red on white for one without colors', () => {
      expect([list.colorDraft(2), list.colorDraft(3)]).toEqual([
        { bgColor: '#00ff00', textColor: 'black' },
        { bgColor: '#ff0000', textColor: 'white' },
      ]);
    });

    it('shows the picked colors until they are saved', () => {
      list.setBgColor(2, '#123abc');
      list.setTextColor(3, 'black');

      expect([list.colorDraft(2), list.colorDraft(3)]).toEqual([
        { bgColor: '#123abc', textColor: 'black' },
        { bgColor: '#ff0000', textColor: 'black' },
      ]);
    });

    it('offers saving only changed colors, ignoring the case of the hex digits', () => {
      list.setBgColor(2, '#00FF00');
      expect([list.isColorChanged(2), list.isColorChanged(3)]).toEqual([false, false]);

      list.setTextColor(2, 'white');
      list.setBgColor(3, '#ff0000');
      expect([list.isColorChanged(2), list.isColorChanged(3)]).toEqual([true, true]);
    });

    it('drops the picked colors when the saved colors arrive again', () => {
      list.setBgColor(2, '#123abc');
      list.typeColors = { 2: { bgColor: '#0000ff', textColor: 'white' } };

      expect([list.colorDraft(2), list.isColorChanged(2)]).toEqual([{ bgColor: '#0000ff', textColor: 'white' }, false]);
    });

    it('copes with colors that are not loaded yet', () => {
      list.typeColors = null;

      expect([list.colorDraft(2), list.isColorChanged(2)]).toEqual([{ bgColor: '#ff0000', textColor: 'white' }, false]);
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
      list.shortNameDrafts[2] = ' ';
      list.saveRow(3);
      list.saveRow(2);

      expect(emitted['saveShortName']).toEqual([
        { typeId: 3, shortName: 'M15' },
        { typeId: 2, shortName: '' },
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

  describe('the row of a discipline', () => {
    beforeEach(() => {
      list.typeColors = { 2: { bgColor: '#00ff00', textColor: 'black' } };
      list.shortNames = { 2: 'J18 B' };
    });

    it('offers saving once its colors or its short name changed', () => {
      expect(list.isRowChanged(2)).toBe(false);

      list.setTextColor(2, 'white');
      list.shortNameDrafts[3] = 'M15';

      expect([list.isRowChanged(2), list.isRowChanged(3)]).toEqual([true, true]);
    });

    it('saves its colors and its short name together', () => {
      list.setBgColor(2, '#123abc');
      list.shortNameDrafts[2] = 'J18';

      list.saveRow(2);

      expect(emitted).toEqual({
        saveTypeColor: [{ typeId: 2, colorData: { bgColor: '#123abc', textColor: 'black' } }],
        setBulkTypeColors: [],
        saveShortName: [{ typeId: 2, shortName: 'J18' }],
      });
    });

    it('saves only what changed', () => {
      list.setBgColor(2, '#123abc');
      list.saveRow(2);
      list.shortNameDrafts[3] = 'M15';
      list.saveRow(3);
      list.saveRow(4);

      expect(emitted).toEqual({
        saveTypeColor: [{ typeId: 2, colorData: { bgColor: '#123abc', textColor: 'black' } }],
        setBulkTypeColors: [],
        saveShortName: [{ typeId: 3, shortName: 'M15' }],
      });
    });
  });
});
