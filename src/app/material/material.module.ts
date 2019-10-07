import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule, MatTabsModule, MatSidenavModule, MatListModule, MatButtonModule, MatIconModule } from '@angular/material';

const matModules = [
  MatToolbarModule,
  MatTabsModule,
  MatSidenavModule,
  MatListModule,
  MatButtonModule,
  MatIconModule
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...matModules
  ],
  exports: [...matModules]
})
export class MaterialModule { }
