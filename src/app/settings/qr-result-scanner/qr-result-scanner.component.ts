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

    @Output()
    freeMatch: EventEmitter<number> = new EventEmitter();

    constructor(private store: Store<any>) {
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
            console.log(videoDevices);
            if (videoDevices.length > 0) {
                let choosenDev;
                for (const dev of videoDevices) {
                    if (dev.label.includes('front')) {
                        choosenDev = dev;
                        break;
                    }
                    if (dev.deviceId.includes('2749f10c624e65d7edb09017fc4df28c697e63bb56057e241bebc92045c192f6')) {
                        choosenDev = dev;
                        break;
                    }
                }
                if (choosenDev) {
                    this.qrScannerComponent.chooseCamera.next(choosenDev);
                } else {
                    console.log(videoDevices[0]);
                    this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
                }
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
