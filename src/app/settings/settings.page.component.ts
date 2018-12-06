import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {LoadPrinters, LoadSettings, SaveAssignAutomatically, SavePrintOnAssign, SetPrinter} from './redux/settings.actions';
import {getPrintersState, getSettingsState} from '../app-state.reducer';
import {Observable} from 'rxjs';
import {Settings} from './settings.model';

@Component({
  selector: 'toma-settings',
  templateUrl: './settings.page.component.html'
})
export class SettingsPageComponent implements OnInit {

    settings: Observable<Settings[]>;
    printers: Observable<string[]>;

    constructor(private store: Store<any>) {
    }

  ngOnInit() {
      this.store.dispatch(new LoadSettings(null));
      this.store.dispatch(new LoadPrinters(null));
      this.settings = this.store.select(getSettingsState);
      this.printers = this.store.select(getPrintersState);
  }

    assignAutomatically(assignAutomatically: boolean) {
        this.store.dispatch(new SaveAssignAutomatically(assignAutomatically));
    }

    printOnAssign(printOnAssign: boolean) {
        this.store.dispatch(new SavePrintOnAssign(printOnAssign));
    }

    savePrinter(printerName: string) {
        this.store.dispatch(new SetPrinter(printerName));
    }

}
