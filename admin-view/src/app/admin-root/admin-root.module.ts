import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRootPageComponent } from './admin-root.page.component';
import { AdminRootComponent } from './admin-root.component';
import { SharedModule } from '../shared/shared.module';
import { PlayerModule } from '../player/player.module';
import { DisciplineModule } from '../discipline/discipline.module';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';
import { TableModule } from '../table/table.module';
import { CallerModule } from '../caller/caller.module';
import { AssignModule } from '../assign/assign.module';
import { SupervisorModule } from '../supervisor/supervisor.module';
import { ResultModule } from '../result/result.module';
import { SettingsModule } from '../settings/settings.module';

const imports = [
  CommonModule,
  RouterModule,
  SharedModule,
  PlayerModule,
  DisciplineModule,
  TableModule,
  CallerModule,
  AssignModule,
  SupervisorModule,
  ResultModule,
  SettingsModule,
];

const moduleExports = [AdminRootPageComponent, AdminRootComponent];

@NgModule({
  imports: imports,
  exports: moduleExports,
  declarations: [...moduleExports, NavigationComponent],
})
export class AdminRootModule {}
