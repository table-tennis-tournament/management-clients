// ====== ./app/app.routes.ts ======

import { Routes, RouterModule } from "@angular/router"
import {PlayerComponent} from "./player.component"

export const routeConfig:Routes = [
    {
        path: "playerView",
        component: PlayerComponent
    },
    {
        path: "",
        redirectTo: "/playerView",
        pathMatch: "full"
    }
];