import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestServiceService {

  constructor(private http: HttpClient) {
  }

  call1(): Observable<string>{
    return this.http.get<string>('api/test1');
  }

  call2(): Observable<string>{
    return this.http.get<string>('api/test2');
  }
}
