import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  @Output() loadingChange = new EventEmitter<boolean>();
  // isLoading = false;

  private totalRequests = 0;

  constructor() {
    // console.log('interceptor');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    this.totalRequests++;
    this.loadingChange.emit(true);

    return next.handle(request).pipe(
      tap(res => {
        if (res instanceof HttpResponse) {
          this.decreaseRequests();
        }
      }),
      catchError(err => {
        this.decreaseRequests();
        throw err;
      })
    );
  }

  private decreaseRequests() {
    this.totalRequests--;
    if (this.totalRequests === 0) {
      this.loadingChange.emit(false);
    }

    // console.log('loading request' + this.totalRequests);
  }
}
