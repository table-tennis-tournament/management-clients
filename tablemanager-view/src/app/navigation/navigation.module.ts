import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {NavigationComponent} from './navigation.component';

@NgModule({
    imports: [
        SharedModule,
        NavigationComponent,
    ],
    exports: [
        NavigationComponent
    ]
})
export class NavigationModule {
}
