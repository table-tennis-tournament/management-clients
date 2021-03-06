import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListPageComponent} from './table/table-list.page.component';
import {AssignMatchPageComponent} from './assign/assign-match.page.component';
import {SupervisorPageComponent} from './supervisor/supervisor.page.component';
import {ResultListPageComponent} from './result/result-list.page.component';
import {SettingsPageComponent} from './settings/settings.page.component';
import {CallerPageComponent} from './caller/caller.page.component';
import {QrResultScannerComponent} from './settings/qr-result-scanner/qr-result-scanner.component';
import {PlayerPageComponent} from './player/player.page.component';

const routes: Routes = [
    {
        path: 'assignView',
        component: AssignMatchPageComponent
    },
    {
        path: 'tableView',
        component: TableListPageComponent,
        data: [{showMatches: true}]
    },
    {
        path: 'supervisorView',
        component: SupervisorPageComponent
    },
    {
        path: 'resultView',
        component: ResultListPageComponent
    },
    {
        path: 'settingsView',
        component: SettingsPageComponent
    },
    {
        path: 'callerView',
        component: CallerPageComponent
    },
    {
        path: 'playerView',
        component: PlayerPageComponent
    },
    {
        path: 'qrView',
        component: QrResultScannerComponent
    },
    {
        path: '',
        redirectTo: '/tableView',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
