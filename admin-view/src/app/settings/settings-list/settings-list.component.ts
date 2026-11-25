import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Settings, ShortNameMap, TypeColor, TypeColorMap } from '../settings.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatMiniFabButton, MatButton, MatIconButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'toma-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCheckbox,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatMiniFabButton,
    MatIcon,
    MatInput,
    MatButton,
    MatIconButton,
    MatButtonToggleGroup,
    MatButtonToggle,
  ],
})
export class SettingsListComponent {
  _settings: Settings[];
  _typeColors: TypeColorMap = {};

  selectedPrinter: string;
  isPrintForAssign: boolean;
  assignAutomatically: boolean;

  /** The colors picked but not saved yet, by discipline id. */
  colorDrafts: TypeColorMap = {};

  static readonly defaultColor: TypeColor = { bgColor: '#ff0000', textColor: 'white' };

  @Input()
  set settings(value: Settings[]) {
    this._settings = value;
    this.setSubSettings();
  }

  get settings() {
    return this._settings;
  }

  @Input()
  printers: string[];

  @Input()
  set typeColors(value: TypeColorMap) {
    this._typeColors = value ?? {};
    this.colorDrafts = {};
  }

  get typeColors() {
    return this._typeColors;
  }

  @Input()
  types: any[];

  /** The saved short names; [shortNameDrafts] holds what is typed but not saved yet. */
  @Input()
  set shortNames(value: ShortNameMap) {
    this._shortNames = value ?? {};
    this.shortNameDrafts = { ...this._shortNames };
  }

  get shortNames() {
    return this._shortNames;
  }

  private _shortNames: ShortNameMap = {};
  shortNameDrafts: ShortNameMap = {};

  readonly maxShortNameLength = 30;

  @Output()
  saveShortName: EventEmitter<{ typeId: number; shortName: string }> = new EventEmitter();

  isShortNameChanged(typeId: number) {
    return (this.shortNameDrafts[typeId] ?? '').trim() !== (this._shortNames[typeId] ?? '');
  }

  /** The picked colors of a discipline, else its saved ones, else red on white. */
  colorDraft(typeId: number): TypeColor {
    return this.colorDrafts[typeId] ?? this._typeColors[typeId] ?? SettingsListComponent.defaultColor;
  }

  setBgColor(typeId: number, bgColor: string) {
    this.colorDrafts[typeId] = { ...this.colorDraft(typeId), bgColor };
  }

  setTextColor(typeId: number, textColor: string) {
    this.colorDrafts[typeId] = { ...this.colorDraft(typeId), textColor };
  }

  isColorChanged(typeId: number) {
    const draft = this.colorDrafts[typeId];
    const saved = this._typeColors[typeId];
    if (!draft) {
      return false;
    }
    return !saved || draft.bgColor.toLowerCase() !== saved.bgColor.toLowerCase() || draft.textColor !== saved.textColor;
  }

  isRowChanged(typeId: number) {
    return this.isColorChanged(typeId) || this.isShortNameChanged(typeId);
  }

  /** Saves what changed in the row of a discipline: its colors, its short name or both. */
  saveRow(typeId: number) {
    if (this.isColorChanged(typeId)) {
      this.saveTypeColor.emit({ typeId, colorData: { ...this.colorDrafts[typeId] } });
    }
    if (this.isShortNameChanged(typeId)) {
      this.saveShortName.emit({ typeId, shortName: (this.shortNameDrafts[typeId] ?? '').trim() });
    }
  }

  @Output()
  printForAssign: EventEmitter<boolean> = new EventEmitter();

  @Output()
  automaticallyAssign: EventEmitter<boolean> = new EventEmitter();

  @Output()
  savePrinter: EventEmitter<string> = new EventEmitter();

  @Output()
  saveTypeColor: EventEmitter<{ typeId: number; colorData: TypeColor }> = new EventEmitter();

  @Output()
  setBulkTypeColors: EventEmitter<TypeColorMap> = new EventEmitter();

  setSaturdayColors() {
    const saturdayColors: TypeColorMap = {
      1: { bgColor: '#959595', textColor: 'white' },
      2: { bgColor: '#bfbfbf', textColor: 'black' },
      3: { bgColor: '#f83232', textColor: 'white' },
      4: { bgColor: '#f79acc', textColor: 'black' },
      5: { bgColor: '#373b90', textColor: 'white' },
      6: { bgColor: '#41aed1', textColor: 'black' },
      7: { bgColor: '#008000', textColor: 'white' },
      8: { bgColor: '#aefd7b', textColor: 'black' },
      9: { bgColor: '#333333', textColor: 'white' },
      10: { bgColor: '#fdfdfd', textColor: 'black' },
      11: { bgColor: '#8c008b', textColor: 'white' },
      12: { bgColor: '#fd04fd', textColor: 'black' },
      13: { bgColor: '#983300', textColor: 'white' },
      14: { bgColor: '#fd9800', textColor: 'black' },
      15: { bgColor: '#334f50', textColor: 'white' },
      16: { bgColor: '#73a9a9', textColor: 'black' },
      17: { bgColor: '#7f7f00', textColor: 'white' },
      18: { bgColor: '#c7c700', textColor: 'black' },
      19: { bgColor: '#007f00', textColor: 'white' },
      20: { bgColor: '#00fd00', textColor: 'black' },
    };
    this.setBulkTypeColors.emit(saturdayColors);
  }

  setSundayColors() {
    const sundayColors: TypeColorMap = {
      1: { bgColor: '#e3980f', textColor: 'white' },
      2: { bgColor: '#fcfb27', textColor: 'black' },
      3: { bgColor: '#4a7d10', textColor: 'white' },
      4: { bgColor: '#b6ce70', textColor: 'black' },
      5: { bgColor: '#a93992', textColor: 'white' },
      6: { bgColor: '#df817e', textColor: 'black' },
      7: { bgColor: '#323232', textColor: 'white' },
      8: { bgColor: '#bebebe', textColor: 'black' },
      9: { bgColor: '#1c3364', textColor: 'white' },
      10: { bgColor: '#7bcafc', textColor: 'black' },
    };
    this.setBulkTypeColors.emit(sundayColors);
  }

  private setSubSettings() {
    this.settings.forEach((setting) => {
      if (setting.key === 'printerName') {
        this.selectedPrinter = setting.value;
      }
      if (setting.key === 'alwaysPrint') {
        this.isPrintForAssign = setting.value;
      }
      if (setting.key === 'autoStart') {
        this.assignAutomatically = setting.value;
      }
    });
  }
}
