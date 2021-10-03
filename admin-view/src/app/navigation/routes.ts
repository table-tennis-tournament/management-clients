import {Routes} from '@angular/router';
import {AdminRootPageComponent} from '../admin-root/admin-root.page.component';
import {CallerPageComponent} from '../caller/caller.page.component';
import {TableListPageComponent} from '../table/table-list.page.component';
import {AssignMatchPageComponent} from '../assign/assign-match.page.component';
import {SupervisorPageComponent} from '../supervisor/supervisor.page.component';
import {ResultListPageComponent} from '../result/result-list.page.component';
import {SettingsPageComponent} from '../settings/settings.page.component';
import {PlayerPageComponent} from '../player/player.page.component';
import {QrResultScannerComponent} from '../settings/qr-result-scanner/qr-result-scanner.component';
export const BASE = 'admin-view';

export const routes: Routes = [{

    path: BASE,
    component: AdminRootPageComponent,
    children: [
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
            path: '', redirectTo: 'tableView',
            pathMatch: 'full'
        }
    ]

}, {
    path: '', redirectTo: BASE, pathMatch: 'full'
},
    {path: '**', redirectTo: BASE, pathMatch: 'full'}
];
