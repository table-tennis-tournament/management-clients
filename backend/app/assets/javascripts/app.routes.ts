// ====== ./app/app.routes.ts ======

import { Routes, RouterModule } from "@angular/router"
import {PlayerComponent} from "./components/player.component"
import {TableViewComponent} from "./components/table.view.component"
import {SupervisorViewComponent} from "./components/supervisor.view.component"
import {TableAssignViewComponent} from "./components/table.assign.view.component"

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
        component: TableViewComponent
    },
    {
        path: "supervisorView",
        component: SupervisorViewComponent
    },
    {
        path: "",
        redirectTo: "/tableView",
        pathMatch: "full"
    }
];