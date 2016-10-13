/// <reference path="../../../node_modules/angular2/typings/browser.d.ts" />

import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {PlayerService} from './service/player.service';
import {AppComponent} from './app.component';

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  PlayerService
]);
