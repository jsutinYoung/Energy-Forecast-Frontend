/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';
import { LogInterceptor } from './log.interceptor';
import { NoopInterceptor } from './noop.interceptor';
import { TrimNameInterceptor } from './trim-name.interceptor';
import { UploadInterceptor } from './upload.interceptor';


/** Http interceptor providers in outside-in order */
export const MyHttpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: TrimNameInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: LogInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true }
];
