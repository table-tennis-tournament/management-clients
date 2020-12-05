import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Settings} from '../settings.model';

@Component({
    selector: 'toma-settings-list',
    templateUrl: './settings-list.component.html',
    styleUrls: ['./settings-list.component.scss']
})
export class SettingsListComponent {

    _settings: Settings [];

    selectedPrinter: string;
    isPrintForAssign: boolean;
    assignAutomatically: boolean;

    constructor() {
    }

    @Input('settings')
    set settings(value: Settings[]) {
        this._settings = value;
        this.setSubSettings();
    }

    get settings() {
        return this._settings;
    }

    @Input()
    printers: string[];

    @Output()
    printForAssign: EventEmitter<boolean> = new EventEmitter();

    @Output()
    automaticallyAssign: EventEmitter<boolean> = new EventEmitter();

    @Output()
    savePrinter: EventEmitter<string> = new EventEmitter();

    private setSubSettings() {
        this.settings.forEach(setting => {
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
