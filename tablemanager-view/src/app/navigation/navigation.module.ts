import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {NavigationComponent} from './navigation.component';

@NgModule({
    declarations: [
        NavigationComponent
    ],
    imports: [
        SharedModule,
    ],
    exports: [
        NavigationComponent
    ]
})
export class NavigationModule {
}
