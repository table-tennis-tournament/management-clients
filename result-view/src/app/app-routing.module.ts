import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ResultComponent} from './result/result.component';
import {ResultModule} from './result/result.module';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/result',
    pathMatch: 'full'
  },
  {path: 'result', component: ResultComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    ResultModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
