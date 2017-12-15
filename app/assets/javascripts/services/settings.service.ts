import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx"
import { StatusDto } from "../data/status.dto";

@Injectable()
export class SettingsService {
  private printerUrl = "printer/all";
  private setPrinterUrl = "printer/set/printerToSet";

  constructor(private http: Http){}


  getAllPrinters(): Observable<string[]>{
    return this.http.get(this.printerUrl).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

  setPrinter(printerToSet: string): Observable<StatusDto>{
    var regEx = new RegExp("printerToSet");
    var url = this.setPrinterUrl.replace(regEx, printerToSet);
    return this.http.get(url).map((res:Response) => res.json())
               .catch((error:any) => Observable.throw(error.json().error || "Server error"));
  }

}
