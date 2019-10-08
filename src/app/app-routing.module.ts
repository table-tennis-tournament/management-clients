import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { TableListComponent } from './table-list/table-list.component';


const routes: Routes = [
  { path: '', component: TableListComponent},
  { path: 'tablemanager', component: TableListComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
