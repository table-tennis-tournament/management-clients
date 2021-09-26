import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {AssignMatchPageComponent} from './assign-match.page.component';
import {DisciplineMatchListComponent} from './discipline-match-list/discipline-match-list.component';
import {MatchlistGroupComponent} from './discipline-match-list/matchlist-group/matchlist-group.component';
import {MatchlistStageComponent} from './discipline-match-list/matchlist-stage/matchlist-stage.component';
import {SingleItemComponent} from './discipline-match-list/single-item/single-item.component';
import {TableModule} from '../table/table.module';
import {DisciplineModule} from '../discipline/discipline.module';

const components = [
    AssignMatchPageComponent,
    DisciplineMatchListComponent,
    MatchlistGroupComponent,
    MatchlistStageComponent,
    SingleItemComponent
];


@NgModule({
    imports: [SharedModule, TableModule, DisciplineModule],
    exports: [AssignMatchPageComponent],
    declarations: [...components]
})
export class AssignModule {
}
