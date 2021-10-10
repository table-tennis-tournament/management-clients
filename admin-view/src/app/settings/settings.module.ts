import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SettingsPageComponent } from './settings.page.component';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { QrResultScannerComponent } from './qr-result-scanner/qr-result-scanner.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

const components = [SettingsPageComponent, SettingsListComponent, QrResultScannerComponent];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, ZXingScannerModule.forRoot()],
  providers: [],
  exports: [SettingsPageComponent],
})
export class SettingsModule {}
