//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TokenService } from '../service/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.

    if (req.url.includes('/oauth/login')) {
      // console.log(req.url);
      return next.handle(req);
    }

    const authToken = this.tokenService.userToken;
    const newHeaders = { Token: `Bearer ${authToken}` };
    // console.log(newHeaders);
    const authReq = req.clone({
      setHeaders: newHeaders
    });

    // console.log(authReq.headers);

    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }
}
