import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
    MzButtonModule,
    MzCheckboxModule,
    MzCollapsibleModule,
    MzCollectionModule,
    MzInputModule,
    MzModalModule,
    MzSelectModule,
    MzSidenavModule,
    MzSpinnerModule,
    MzTabModule
} from 'ngx-materialize';

const matModules = [
    MzButtonModule,
    MzCheckboxModule,
    MzCollapsibleModule,
    MzCollectionModule,
    MzInputModule,
    MzModalModule,
    MzSelectModule,
    MzSidenavModule,
    MzSpinnerModule,
    MzTabModule
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        ...matModules
    ],
    providers: [],
    exports: [...matModules]
})
export class MaterializeModule {
}
