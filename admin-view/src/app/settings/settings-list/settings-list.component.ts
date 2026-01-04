import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings, TypeColor, TypeColorMap } from '../settings.model';

@Component({
    selector: 'toma-settings-list',
    templateUrl: './settings-list.component.html',
    styleUrls: ['./settings-list.component.scss'],
    standalone: false
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
        textColor: this.selectedTextColor
      }
    });
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
