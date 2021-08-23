import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../material/material.module';
import {TtPlayerNameReducerPipe} from './pipes/tt-player-name-reducer.pipe';
import {TtMatchDisciplinePipe} from './pipes/tt-match-discipline.pipe';
import {ResultPipe} from './pipes/result.pipe';
import {TeamItemComponent} from './team-item/team-item.component';
import {DisciplineTypePipe} from './pipes/discipline-type.pipe';

const modules = [CommonModule, RouterModule, BrowserModule, MaterialModule,
    BrowserAnimationsModule, FormsModule];

const providers = [TtPlayerNameReducerPipe, ResultPipe, TtMatchDisciplinePipe, TeamItemComponent, DisciplineTypePipe];

@NgModule({
    declarations: [...providers],
    imports: [
        ...modules
    ],
    exports: [
        ...modules,
        ...providers
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {
    static forRoot() {
        return {
            ngModule: SharedModule,
            providers: [...providers]
        };
    }
}
