import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
//import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { FreeTable } from '../../table/redux/table.actions';

@Component({
  selector: 'toma-qr-result-scanner',
  templateUrl: './qr-result-scanner.component.html',
  styleUrls: ['./qr-result-scanner.component.scss'],
})
export class QrResultScannerComponent implements OnInit {
  @Output()
  freeMatch: EventEmitter<number> = new EventEmitter();

  // @ViewChild(ZXingScannerComponent, {
  //   read: ZXingScannerComponent,
  //   static: false,
  // })
  // scanner: ZXingScannerComponent;

  private hasCameras: boolean;
  availableDevices: MediaDeviceInfo[];

  private _selectedDevice: string;
  selectedMediaDevice: MediaDeviceInfo;

  set selectedDevice(value: string) {
    this._selectedDevice = value;
    //this.selectedMediaDevice = this.scanner.getDeviceById(value);
  }

  get selectedDevice(): string {
    return this._selectedDevice;
  }

  constructor(private store: Store<any>) {}

  ngOnInit() {
    // this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
    //   this.hasCameras = true;
    //
    //   console.log('Devices: ', devices);
    //   this.availableDevices = devices;
    // });
  }

  handleQrCodeResult(result) {
    if (+result > 0) {
      this.store.dispatch(
        new FreeTable({
          matchIds: [+result],
        })
      );
    }
    console.log('found image');
    console.log(result);
  }

  onDeviceSelectChange(selectedDevice) {
    console.log(selectedDevice);
  }
}
