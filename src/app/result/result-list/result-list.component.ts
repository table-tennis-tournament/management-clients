import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {Discipline} from '../../discipline/discipline.model';
import {MatchState} from '../../shared/data/matchstate.model';
import {QrScannerComponent} from 'angular2-qrscanner';

@Component({
    selector: 'toma-result-list',
    templateUrl: './result-list.component.html',
    styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit {

    private _matches: Match[];
    private selectedDisciplineId = 0;

    @Output()
    freeMatch: EventEmitter<number> = new EventEmitter();

    @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent;

    @Input('matches')
    set matches(value: Match[]) {
        this._matches = value;
        this.onTypeChanged(this.selectedDisciplineId);
    }

    get matches() {
        return this._matches;
    }

    @Input()
    disciplines: Discipline[];

    @Output()
    takeBackMatch: EventEmitter<Match> = new EventEmitter<Match>();

    @Output()
    resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

    @Input()
    matchesLoading: boolean;

    selectedMatches: Match[];

    constructor() {
    }

    onTypeChanged(disciplineId) {
        this.selectedDisciplineId = disciplineId;
        if (disciplineId === 0) {
            this.selectedMatches = this.matches.filter(this.matchIsReadyForResult);
            return;
        }
        this.selectedMatches = this.matches
            .filter(match => match.type.id === disciplineId)
            .filter(match => match.state === MatchState[MatchState.Finished]);
    }

    ngOnInit() {
        this.qrScannerComponent.getMediaDevices().then(devices => {
            console.log(devices);
            const videoDevices: MediaDeviceInfo[] = [];
            for (const device of devices) {
                if (device.kind.toString() === 'videoinput') {
                    videoDevices.push(device);
                }
            }
            if (videoDevices.length > 0) {
                let choosenDev;
                for (const dev of videoDevices) {
                    if (dev.label.includes('front')) {
                        choosenDev = dev;
                        break;
                    }
                    if (dev.deviceId.includes('0fc8c39985c48189a20ec62b287901081e613fc33fda912085a3635d814a952d')) {
                        choosenDev = dev;
                        break;
                    }
                }
                if (choosenDev) {
                    this.qrScannerComponent.chooseCamera.next(choosenDev);
                } else {
                    this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
                }
            }
        });

        this.qrScannerComponent.capturedQr.subscribe(result => {
            if(+result > 0){
                this.freeMatch.emit(+result);
            }
            console.log('found image');
            console.log(result);
        });
    }

}
