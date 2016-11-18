// ====== ./app/app.routes.ts ======

import { Routes, RouterModule } from "@angular/router"
import { AppComponent } from "./app.component"

export const routeConfig:Routes = [
    {
        path: "playerView",
        component: AppComponent
    }
];