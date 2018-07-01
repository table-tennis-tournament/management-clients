import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableviewComponent} from './tableview/tableview.component';

const routes: Routes = [
    {
        path: 'playerView',
        component: TableviewComponent
    },
    {
        path: 'assignView',
        component: TableviewComponent
    },
    {
        path: 'tableView',
        component: TableviewComponent,
        data: [{showMatches: true}]
    },
    {
        path: 'supervisorView',
        component: TableviewComponent
    },
    {
        path: 'resultView',
        component: TableviewComponent
    },
    {
        path: 'settingsView',
        component: TableviewComponent
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
