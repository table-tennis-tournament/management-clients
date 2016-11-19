// ====== ./app/app.routes.ts ======

import { Routes, RouterModule } from "@angular/router"
import {PlayerComponent} from "./components/player.component"
import {MatchComponent} from "./components/match.component"

export const routeConfig:Routes = [
    {
        path: "playerView",
        component: PlayerComponent
    },
    {
        path: "matchView",
        component: MatchComponent
    },
    {
        path: "",
        redirectTo: "/playerView",
        pathMatch: "full"
    }
];