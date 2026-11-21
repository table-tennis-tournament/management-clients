import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  LoadPrinters,
  LoadSettings,
  LoadTypeColors,
  SaveAssignAutomatically,
  SavePrintOnAssign,
  SaveTypeColor,
  SetBulkTypeColors,
  SetPrinter,
} from './redux/settings.actions';
import { getPrintersState, getSettingsState, getTypeColorsMapState } from '../app-state.reducer';
import { Observable } from 'rxjs';
import { Settings, TypeColor, TypeColorMap } from './settings.model';
import { getDisciplineState } from '../discipline/redux';
import { Discipline } from '../discipline/discipline.model';
import { LoadDiscipline } from '../discipline/redux/discipline.actions';
import { MatCard, MatCardContent } from '@angular/material/card';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'toma-settings',
  templateUrl: './settings.page.component.html',
  imports: [MatCard, MatCardContent, SettingsListComponent, AsyncPipe],
})
export class SettingsPageComponent implements OnInit {
  private store = inject<Store<any>>(Store);

  settings: Observable<Settings[]>;
  printers: Observable<string[]>;
  typeColors$: Observable<TypeColorMap>;
  types$: Observable<Discipline[]>;

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
