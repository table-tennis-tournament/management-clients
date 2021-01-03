import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListComponent} from './table-list/table-list.component';
import {TableListModule} from './table-list/table-list.module';


const routes: Routes = [
    {
        path: '',
        redirectTo: '/tablemanager1',
        pathMatch: 'full'
    },
    {path: 'tablemanager1', component: TableListComponent, data: {tableManagerId: 1}},
    {path: 'tablemanager2', component: TableListComponent, data: {tableManagerId: 2}},
    {path: 'tablemanager3', component: TableListComponent, data: {tableManagerId: 3}},
    {path: 'tablemanager4', component: TableListComponent, data: {tableManagerId: 4}},
    {path: 'tablemanager5', component: TableListComponent, data: {tableManagerId: 5}}
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        TableListModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
