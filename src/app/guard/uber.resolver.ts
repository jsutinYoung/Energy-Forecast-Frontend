import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';


interface UType {
  id: number;
  message: string;
}
type PType = Observable<UType>|Promise<UType>|UType;


export class UberResolver implements Resolve<UType> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): PType {
    const promise = new Promise<UType>((resolve, reject) => {
      setTimeout(() => {
        resolve(<UType>{
          id: 12,
          message: 'You are in dummy land, it will prevent you from leaving.'
        });
      }, 2000);
    });

    return promise;
  }
}
