//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {DashComp} from './dash.comp/dash.comp';
import {DummyComp} from './dummy.comp/dummy.comp';
import {ErrorPageComp} from './error-page.comp/error-page.comp';
import {AuthGuard} from './guard/auth-guard';
import {CanDeactivateGuard} from './guard/can-deactivate.guard';
import {UberResolver} from './guard/uber.resolver';
import {LoginComp} from './login.comp/login.comp';

const routes: Routes = [
  {path: '', component: LoginComp, pathMatch: 'full'},
  // {path: 'no',canActivateChild: [AuthGuard], component: NotFoundComp,
  //   children: [
  //     {path: 'a', component: NotFoundComp},
  //     {path: 'b', component: NotFoundComp}
  //   ]
  // },
  { path: 'signup', component: LoginComp, data: { open: true } },
  {
    path: 'dummy',
    canDeactivate: [CanDeactivateGuard],
    component: DummyComp,
    pathMatch: 'full',
    resolve: {key: UberResolver}
  },
  {
    path: 'dash',
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
    component: DashComp
  },
  {path: '**', component: ErrorPageComp, data: {message: 'Link not found!'}}
];

@NgModule({
  imports: [RouterModule.forRoot(
      routes,
      {
        enableTracing: false,  // <-- debugging purposes only
        useHash: false,
        // preloadingStrategy: SelectivePreloadingStrategyService,
      })],
  exports: [RouterModule],
  providers: [CanDeactivateGuard, UberResolver]
})
export class AppRoutingModule {
}
