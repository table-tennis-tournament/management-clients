import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../material/material.module';

const modules = [CommonModule, MaterialModule, RouterModule, FormsModule, ReactiveFormsModule];

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
