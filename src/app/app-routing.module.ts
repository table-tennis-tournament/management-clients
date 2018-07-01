import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListPageComponent} from './table/table-list.page.component';
import {TableListComponent} from './table/table-list/table-list.component';

const routes: Routes = [
    {
        path: 'playerView',
        component: TableListComponent
    },
    {
        path: 'assignView',
        component: TableListComponent
    },
    {
        path: 'tableView',
        component: TableListPageComponent,
        data: [{showMatches: true}]
    },
    {
        path: 'supervisorView',
        component: TableListComponent
    },
    {
        path: 'resultView',
        component: TableListComponent
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
