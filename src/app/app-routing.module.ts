import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ResultComponent} from './result/result.component';
import {ResultModule} from './result/result.module';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/tablemanager/1',
    pathMatch: 'full'
  },
  {path: 'tablemanager/:managerId', component: ResultComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    ResultModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
