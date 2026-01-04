import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Settings, TypeColor, TypeColorMap } from './settings.model';
import { HttpClient } from '@angular/common/http';
import { StatusDto } from '../shared/statusdto.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private http: HttpClient) {}

  loadSettings(): Observable<Settings[]> {
    return this.http.get<Settings[]>(`api/settings/all`);
  }

  loadPrinters(): Observable<string[]> {
    return this.http.get<string[]>(`api/printer/all`);
  }

  saveAssignAutomatically(shouldAssignAutomatically: boolean): Observable<StatusDto> {
    return this.http.get<StatusDto>(`api/matchlist/active/${shouldAssignAutomatically}`);
  }

  savePrintOnAssign(savePrintOnAssign: boolean): Observable<StatusDto> {
    return this.http.get<StatusDto>(`api/printer/setprintonstart/${savePrintOnAssign}`);
  }

  setPrinter(printerName: string): Observable<StatusDto> {
    return this.http.get<StatusDto>(`api/printer/set/${printerName}`);
  }

  loadTypeColors(): Observable<TypeColorMap> {
    return this.http.get<TypeColorMap>('api/settings/typecolors');
  }

  saveTypeColor(typeId: number, colorData: TypeColor): Observable<StatusDto> {
    return this.http.post<StatusDto>(`api/settings/typecolors/${typeId}`, colorData);
  }

  setBulkTypeColors(typeColors: TypeColorMap): Observable<StatusDto> {
    return this.http.put<StatusDto>('api/settings/typecolors', typeColors);
  }
}
