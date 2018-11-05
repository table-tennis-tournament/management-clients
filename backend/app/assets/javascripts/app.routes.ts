// ====== ./app/app.routes.ts ======

import {Routes} from "@angular/router"
import {PlayerComponent} from "./components/player.component"
import {TableViewComponent} from "./components/table.view.component"
import {SupervisorViewComponent} from "./components/supervisor.view.component"
import {TableAssignViewComponent} from "./components/table.assign.view.component"
import {ResultViewComponent} from "./components/result.view.component"
import {SettingsComponent} from "./components/settings/settings.component";

export const routeConfig:Routes = [
    {
        path: "playerView",
        component: PlayerComponent
    },
    {
        path: "assignView",
        component: TableAssignViewComponent
    },
    {
        path: "tableView",
        component: TableViewComponent,
        data:[{showMatches: true}]
    },
    {
        path: "supervisorView",
        component: SupervisorViewComponent
    },
    {
        path: "resultView",
        component: ResultViewComponent
    },
    {
        path: "settingsView",
        component: SettingsComponent
    },
    {
        path: "",
        redirectTo: "/tableView",
        pathMatch: "full"
    }
];