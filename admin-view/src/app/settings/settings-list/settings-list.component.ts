import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings, TypeColor, TypeColorMap } from '../settings.model';

@Component({
  selector: 'toma-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
  standalone: false,
})
export class SettingsListComponent {
  _settings: Settings[];
  _typeColors: TypeColorMap = {};

  selectedPrinter: string;
  isPrintForAssign: boolean;
  assignAutomatically: boolean;

  // Type color management
  selectedTypeId: number;
  selectedBgColor: string = '#FF0000';
  selectedTextColor: string = 'white';

  constructor() {}

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
    this._typeColors = value;
    this.updateSelectedColors();
  }

  get typeColors() {
    return this._typeColors;
  }

  @Input()
  types: any[];

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

  onTypeSelected() {
    this.updateSelectedColors();
  }

  private updateSelectedColors() {
    if (this.selectedTypeId && this._typeColors && this._typeColors[this.selectedTypeId]) {
      const colors = this._typeColors[this.selectedTypeId];
      this.selectedBgColor = colors.bgColor;
      this.selectedTextColor = colors.textColor;
    } else {
      this.selectedBgColor = '#FF0000';
      this.selectedTextColor = 'white';
    }
  }

  saveTypeColorClick() {
    if (!this.selectedTypeId) {
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(this.selectedBgColor)) {
      alert('Ungültiges Farbformat. Bitte verwenden Sie #RRGGBB');
      return;
    }

    this.saveTypeColor.emit({
      typeId: this.selectedTypeId,
      colorData: {
        bgColor: this.selectedBgColor,
        textColor: this.selectedTextColor,
      },
    });
  }

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
