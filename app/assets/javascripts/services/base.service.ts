import {Injectable} from "@angular/core"
import {Observable} from "rxjs/Rx";
import {Http, Response, Headers, RequestOptions, RequestOptionsArgs } from "@angular/http"
import { StatusDto } from "../data/status.dto";

@Injectable()
export class BaseService {

    public HandleError(error: Response | any): Observable<StatusDto>{
        var errMsg = "";
        var newStatus = new StatusDto();
        if (error instanceof Response) {
            newStatus = error.json() || newStatus;
            return Observable.throw(newStatus);
            
        }
        errMsg = error.message ? error.message : error.toString();
        newStatus.message = errMsg;
        return Observable.throw(newStatus);
    }


    public getHeaders():RequestOptionsArgs{
        var headers = new Headers();
        headers.append("Content-Type", "application/json");
        return {headers: headers};
    }

}
