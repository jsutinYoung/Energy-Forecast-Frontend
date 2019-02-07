//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';

export type OPBtype = Observable<boolean>| Promise<boolean>| boolean;

export interface ICanCompDeactivate {
  allowDeactivate: () => OPBtype;
}


export class CanDeactivateGuard implements CanDeactivate<ICanCompDeactivate> {
  canDeactivate(
      component: ICanCompDeactivate, currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): OPBtype {

    // console.log(currentRoute);
    return component.allowDeactivate();
  }
}
