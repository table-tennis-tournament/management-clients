import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {QrScannerComponent} from 'angular2-qrscanner';
import {Store} from '@ngrx/store';
import {FreeTable} from '../../table/redux/table.actions';

@Component({
    selector: 'toma-qr-result-scanner',
    templateUrl: './qr-result-scanner.component.html',
    styleUrls: ['./qr-result-scanner.component.scss']
})
export class QrResultScannerComponent implements OnInit {

    @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent;

    VIDEO_ID = '2749f10c624e65d7edb09017fc4df28c697e63bb56057e241bebc92045c192f6';

    @Output()
    freeMatch: EventEmitter<number> = new EventEmitter();

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.qrScannerComponent.getMediaDevices().then(devices => {
            const videoDevices: MediaDeviceInfo[] = devices.filter(device => device.kind.toString() === 'videoinput');
            console.log(videoDevices);
            if (videoDevices.length > 0) {
                let chosenDevice;
                for (const device of videoDevices) {
                    if (device.deviceId.includes(this.VIDEO_ID)) {
                        chosenDevice = device;
                        break;
                    }
                }
                if (chosenDevice) {
                    this.qrScannerComponent.chooseCamera.next(chosenDevice);
                    return;
                }
                console.log(videoDevices[0]);
                this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
            }
        });

        this.qrScannerComponent.capturedQr.subscribe(result => {
            if (+result > 0) {
                this.store.dispatch(new FreeTable({
                        matchIds: [+result]
                    }));
            }
            console.log('found image');
            console.log(result);
        });
    }

}
