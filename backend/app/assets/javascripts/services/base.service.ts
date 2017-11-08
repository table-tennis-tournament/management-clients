import {Injectable} from "@angular/core"
import {Observable} from "rxjs/Rx";
import {Http, Response, Headers, RequestOptions, RequestOptionsArgs } from "@angular/http"

@Injectable()
export class BaseService {

    public HandleError(error:any, obs: Observable<any>): Observable<any>{
        Observable.throw(error.json().error || "Server error")
        return null;
    }


    public getHeaders():RequestOptionsArgs{
        var headers = new Headers();
        headers.append("Content-Type", "application/json");
        return {headers: headers};
    }

}
