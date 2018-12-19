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
            this.selectedMatches = this.matches
                .filter(match => match.state === MatchState[MatchState.Finished]);
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
                    if (dev.label.includes('e27830bfb1bb4285810e9e9a5ee355af17a9e5e8b38bd1e9f7f1e58ea8adac05')) {
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
            console.log(result);
        });
    }

}
