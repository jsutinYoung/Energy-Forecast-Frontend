import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {AuthService} from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.

    console.log('Auth Interceptor');

    const authToken = this.auth.getToken();
    const authReq =
        req.clone({setHeaders: {Authorization: `Bearer ${authToken}`}});

    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }
}
