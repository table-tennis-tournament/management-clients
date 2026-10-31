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
    return this.http.get<Settings[]>(`/api/v2/settings/all`);
  }

  loadPrinters(): Observable<string[]> {
    return this.http.get<string[]>(`/api/v2/printer/all`);
  }

  saveAssignAutomatically(shouldAssignAutomatically: boolean): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/matchlist/active/${shouldAssignAutomatically}`, null);
  }

  savePrintOnAssign(savePrintOnAssign: boolean): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/printer/setprintonstart/${savePrintOnAssign}`, null);
  }

  setPrinter(printerName: string): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/printer/set/${printerName}`, null);
  }

  loadTypeColors(): Observable<TypeColorMap> {
    return this.http.get<TypeColorMap>('/api/v2/disciplines/colors');
  }

  saveTypeColor(typeId: number, colorData: TypeColor): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/disciplines/${typeId}/color`, colorData);
  }

  setBulkTypeColors(typeColors: TypeColorMap): Observable<StatusDto> {
    return this.http.put<StatusDto>('/api/v2/disciplines/colors', typeColors);
  }
}
