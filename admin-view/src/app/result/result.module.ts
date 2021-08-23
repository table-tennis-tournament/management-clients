import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {ResultListPageComponent} from './result-list.page.component';
import {DisciplinePipe} from './pipes/discipline.pipe';
import {StagePipe} from './pipes/stage.pipe';
import {ResultListComponent} from './result-list/result-list.component';
import {DisciplineModule} from '../discipline/discipline.module';

const components = [
    ResultListPageComponent,
    DisciplinePipe,
    StagePipe,
    ResultListComponent
];

@NgModule({
    declarations: [
        ...components
    ],
    imports: [
        SharedModule,
        DisciplineModule
    ],
    providers: [],
    exports: [ResultListPageComponent]
})
export class ResultModule {
}
