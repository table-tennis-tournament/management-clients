import {Injectable} from "@angular/core"
import {Subject} from "rxjs/Subject";

@Injectable()
export class ExpandCollapsibleService {

    private currentCounter: number;
    // Observable string sources
    private missionAnnouncedSource = new Subject<boolean>();
    private missionConfirmedSource = new Subject<boolean>();

    // Observable string streams
    expandPlayers$ = this.missionAnnouncedSource.asObservable();
    expandMatches$ = this.missionConfirmedSource.asObservable();

    // Service message commands
    expandPlayer() {
        this.missionAnnouncedSource.next(true);
    }

    expandMatches() {
        this.missionConfirmedSource.next(true);
    }

    constructor(){
        this.currentCounter = 0;
    }

}
