import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Settings} from './settings.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient) { }

    loadSettings(): Observable<Settings[]>{
        return this.http.get<Settings[]>(`api/settings/all`);
    }
}
