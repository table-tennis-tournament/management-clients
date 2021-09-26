import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {DisciplineModule} from '../discipline/discipline.module';
import {SupervisorPageComponent} from './supervisor.page.component';
import {DisciplineGroupComponent} from './discipline-view/discipline-group/discipline-group.component';
import {DisciplineStageItemComponent} from './discipline-view/discipline-stage/discipline-stage-item/discipline-stage-item.component';
import {DisciplineStageComponent} from './discipline-view/discipline-stage/discipline-stage.component';
import {DisciplineViewComponent} from './discipline-view/discipline-view.component';
import {MatchlistGroupItemComponent} from "./matchlist-view/matchlist-group-item/matchlist-group-item.component";
import {MatchlistViewComponent} from "./matchlist-view/matchlist-view.component";
import {MatchlistSingleItemComponent} from "./matchlist-view/matchlist-single-item/matchlist-single-item.component";

const components = [
    SupervisorPageComponent,
    DisciplineGroupComponent,
    DisciplineStageComponent,
    DisciplineStageItemComponent,
    DisciplineViewComponent,
    MatchlistViewComponent,
    MatchlistGroupItemComponent,
    MatchlistSingleItemComponent
];

@NgModule({
    declarations: [
        ...components
    ],
    imports: [
        SharedModule,
        DisciplineModule,
    ],
    providers: [],
    exports: [SupervisorPageComponent]
})
export class SupervisorModule {
}
