import {Injectable} from "@angular/core"
import {Http, Response, Headers, RequestOptions } from "@angular/http"
import {Observable} from "rxjs/Rx"
import { StatusDto } from "../data/status.dto";
import { BaseService } from "./base.service";
import { SettingDto } from "../data/setting.dto";

@Injectable()
export class SettingsService {
  private printerUrl = "api/printer/all";
  private setPrinterUrl = "api/printer/set/printerToSet";
  private setPrintToAssignUrl = "api/printer/setprintonstart/valueToSet";
  private getAllSettingsUrl = "api/settings/all ";
  private matchlistActiveUrl = "api/matchlist/active";

  constructor(private http: Http, private baseService: BaseService){}


  getAllPrinters(): Observable<string[]>{
    return this.http.get(this.printerUrl).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
  }

  setPrinter(printerToSet: string): Observable<StatusDto>{
    var regEx = new RegExp("printerToSet");
    var url = this.setPrinterUrl.replace(regEx, printerToSet);
    return this.http.get(url).map((res:Response) => res.json())
               .catch(this.baseService.HandleError);
  }

  setIsPrintForAssign(isSetToAssign:boolean){
    var regEx = new RegExp("valueToSet");
    var url = this.setPrintToAssignUrl.replace(regEx, isSetToAssign.toString());
    return this.http.get(url).map((res:Response) => res.json())
                .catch(this.baseService.HandleError);
  }

  getAllSettings(): Observable<SettingDto>{
    return this.http.get(this.getAllSettingsUrl).map((res:Response) => res.json())
                .catch(this.baseService.HandleError);
  }

  setMatchlistActive(isActive:boolean):Observable<StatusDto>{
    var query = this.matchlistActiveUrl + "/"+isActive.toString();
    return this.http.get(query).map((res:Response) => res.json())
           .catch(this.baseService.HandleError);
}

}
