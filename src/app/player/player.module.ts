import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PlayerPageComponent} from './player.page.component';


@NgModule({
    declarations: [PlayerPageComponent],
    imports: [
        CommonModule
    ],
    providers: [],
    exports: [PlayerPageComponent]
})
export class PlayerModule {
}