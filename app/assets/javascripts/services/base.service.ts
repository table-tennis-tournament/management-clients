import {Injectable} from "@angular/core"
import {Observable} from "rxjs/Rx";
import {Headers, Http, RequestOptionsArgs, Response} from "@angular/http"
import {StatusDto} from "../data/status.dto";

@Injectable()
export class BaseService {

    constructor(private http:Http){

    }

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

    public post(url: string, body: any):Observable<any>{
        return this.http.post(url, JSON.stringify(body), this.getHeaders())
            .map((res:Response) => res.json())
            .catch(this.HandleError);
    }

    public get(url: string):Observable<any>{
        return this.http.get(url).map((res:Response) => res.json())
            .catch(this.HandleError)
    }

}
