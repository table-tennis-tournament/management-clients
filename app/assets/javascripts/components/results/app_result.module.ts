// ====== ./app/app.module.ts ======
// Imports
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"
import {FormsModule} from "@angular/forms"
import {HttpModule, JsonpModule} from "@angular/http"
import {APP_BASE_HREF, CommonModule} from "@angular/common"

import {MaterializeModule} from "angular2-materialize";

import {AppResultComponent} from "../../components/results/app_result.component"

import {MatchService} from "../../services/match.service"
import {TableService} from "../../services/table.service"

import {MatchToStringService} from "../../services/match.toString.service"
import {ToastService} from "../../services/toast.service";
import {BaseService} from "../../services/base.service";
import {ResultGroupViewComponent} from "../../components/results/result.group.view.component";
import {ResultStageViewComponent} from "../../components/results/result.stage.view.component";
import {ResultMatchItemComponent} from "../../components/results/result.match.item.component";
import {TeamMatchItemComponent} from "../../components/items/team.match.item.component";
import {MatchHelperService} from "../../services/match.helper.service";
import {ResultStringItemComponent} from "../../components/results/result.string.component";


@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpModule,
    JsonpModule,
    MaterializeModule
  ],
  declarations: [
    AppResultComponent,
    ResultGroupViewComponent,
    ResultStageViewComponent,
    ResultMatchItemComponent,
    ResultStringItemComponent,
    TeamMatchItemComponent
  ],
  providers: [
      MatchService,
      TableService,
      BaseService,
      MatchToStringService,
      ToastService,
      MatchHelperService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [AppResultComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppResultModule {
    // Module class
}