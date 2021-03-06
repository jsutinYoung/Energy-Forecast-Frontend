//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';
import { LogInterceptor } from './log.interceptor';
import { LoadingInterceptor } from './loading.interceptor';
import { TrimNameInterceptor } from './trim-name.interceptor';
import { UploadInterceptor } from './upload.interceptor';
import { TimezoneInterceptor } from './timezone.interceptor';

/** Http interceptor providers in outside-in order */
export const MyHttpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: TrimNameInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TimezoneInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: LogInterceptor, multi: true }
  // { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true }
];
