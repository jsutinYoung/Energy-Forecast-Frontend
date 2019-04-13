//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class TimezoneInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/demand')) {
      // clone request and set its body
      const newReq = req.clone({ body: { ...req.body, timezone: 'America/Los_Angeles' } });
      // send the cloned request to the next handler.
      return next.handle(newReq);
    } else {
      return next.handle(req);
    }
  }
}
