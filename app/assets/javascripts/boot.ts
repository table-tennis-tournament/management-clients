import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import {bootstrap} from '@angular/platform/browser';
// import {ROUTER_PROVIDERS} from '@angular/router';
// import {HTTP_PROVIDERS} from '@angular/http';
import {PlayerService} from './service/player.service';
import {AppModule} from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
// bootstrap(AppComponent, [
//   HTTP_PROVIDERS,
//   ROUTER_PROVIDERS,
//   PlayerService
// ]);
