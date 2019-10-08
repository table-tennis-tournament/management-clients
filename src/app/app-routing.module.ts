import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TableListComponent} from './table-list/table-list.component';
import {TableListModule} from './table-list/table-list.module';


const routes: Routes = [
    {path: '', component: TableListComponent},
    {path: 'tablemanager', component: TableListComponent}
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
