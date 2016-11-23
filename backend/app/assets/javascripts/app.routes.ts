// ====== ./app/app.routes.ts ======

import { Routes, RouterModule } from "@angular/router"
import {PlayerComponent} from "./components/player.component"
import {TableViewComponent} from "./components/table.view.component"

export const routeConfig:Routes = [
    {
        path: "playerView",
        component: PlayerComponent
    },
    {
        path: "tableView",
        component: TableViewComponent
    },
    {
        path: "",
        redirectTo: "/tableView",
        pathMatch: "full"
    }
];