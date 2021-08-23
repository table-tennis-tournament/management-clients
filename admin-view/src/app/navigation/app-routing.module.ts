import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListPageComponent} from '../table/table-list.page.component';
import {AssignMatchPageComponent} from '../assign/assign-match.page.component';
import {SupervisorPageComponent} from '../supervisor/supervisor.page.component';
import {ResultListPageComponent} from '../result/result-list.page.component';
import {SettingsPageComponent} from '../settings/settings.page.component';
import {CallerPageComponent} from '../caller/caller.page.component';
import {QrResultScannerComponent} from '../settings/qr-result-scanner/qr-result-scanner.component';
import {PlayerPageComponent} from '../player/player.page.component';
import {routes} from './routes';


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
