import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  LoadPrinters,
  LoadSettings,
  SaveAssignAutomatically,
  SavePrintOnAssign,
  SetPrinter,
  LoadTypeColors,
  SaveTypeColor,
  SetBulkTypeColors,
} from './redux/settings.actions';
import { getPrintersState, getSettingsState, getTypeColorsMapState, getTypeColorsState } from '../app-state.reducer';
import { Observable } from 'rxjs';
import { Settings, TypeColor, TypeColorMap } from './settings.model';
import { getTypeColors } from './redux/settings.reducer';
import { getDisciplineState } from '../discipline/redux';
import { Discipline } from '../discipline/discipline.model';
import { LoadDiscipline } from '../discipline/redux/discipline.actions';

@Component({
    selector: 'toma-settings',
    templateUrl: './settings.page.component.html',
    standalone: false
})
export class SettingsPageComponent implements OnInit {
  settings: Observable<Settings[]>;
  printers: Observable<string[]>;
  typeColors$: Observable<TypeColorMap>;
  types$: Observable<Discipline[]>;

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.store.dispatch(new LoadSettings());
    this.store.dispatch(new LoadPrinters());
    this.store.dispatch(new LoadTypeColors());
    this.store.dispatch(new LoadDiscipline(null));
    this.settings = this.store.select(getSettingsState);
    this.printers = this.store.select(getPrintersState);
    this.typeColors$ = this.store.select(getTypeColorsMapState);
    this.types$ = this.store.select(getDisciplineState);
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

  onSaveTypeColor(payload: { typeId: number; colorData: TypeColor }) {
    this.store.dispatch(new SaveTypeColor(payload));
  }

  onSetBulkTypeColors(typeColors: TypeColorMap) {
    this.store.dispatch(new SetBulkTypeColors(typeColors));
  }
}
