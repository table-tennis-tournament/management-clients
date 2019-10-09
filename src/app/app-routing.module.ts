import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListComponent} from './table-list/table-list.component';
import {TableListModule} from './table-list/table-list.module';


const routes: Routes = [
    {
        path: '',
        redirectTo: '/tablemanager/1',
        pathMatch: 'full'
    },
    {path: 'tablemanager/:managerId', component: TableListComponent}
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true}),
        TableListModule
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
