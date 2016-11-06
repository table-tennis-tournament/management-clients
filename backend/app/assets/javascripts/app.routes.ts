// ====== ./app/app.routes.ts ======

import { ModuleWithProviders }  from "@angular/core"
import { Routes, RouterModule } from "@angular/router"
import { AppComponent } from "./app.component"

// Route Configuration
export const routes: Routes = [
  { path: "player", component: AppComponent }
];


export const routing: ModuleWithProviders = RouterModule.forRoot(routes);