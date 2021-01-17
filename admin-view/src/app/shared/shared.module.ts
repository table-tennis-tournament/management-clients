import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterializeModule} from '../materialize/materialize.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../material/material.module';

const modules = [CommonModule, MaterializeModule, RouterModule, BrowserModule, MaterialModule,
    BrowserAnimationsModule, FormsModule];

@NgModule({
    declarations: [],
    imports: [
        ...modules
    ],
    exports: [
        ...modules
    ]
})
export class SharedModule {
}
