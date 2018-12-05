import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListPageComponent} from './table/table-list.page.component';
import {TableListComponent} from './table/table-list/table-list.component';
import {AssignMatchPageComponent} from './assign/assign-match.page.component';
import {SupervisorPageComponent} from './supervisor/supervisor.page.component';
import {ResultListPageComponent} from './result/result-list.page.component';

const routes: Routes = [
    {
        path: 'playerView',
        component: TableListComponent
    },
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
        component: TableListComponent
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
