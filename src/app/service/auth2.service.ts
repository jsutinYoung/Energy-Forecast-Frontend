import {HttpClient} from '@angular/common/http';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Credential {
  email: string;
  password: string;
}

@Injectable({providedIn: 'root'})

export class Auth2Service {
  private token = '';
  private configUrl = 'assets/config.json';

  constructor(private http: HttpClient) {}

  async signupUser(email: string, password: string): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      console.log('Sign up user failed.' + error);
      return false;
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    try {
      this.token = '';

      const result = await this.http.get<Credential>(this.configUrl)
                    .pipe(
                        retry(3),  // retry a failed request up to 3 times
                        catchError(this.handleError)  // then handle the error
                    );


      // return result.toPromise(true);
      return true;
    } catch (error) {
      console.log('Authentication failed.' + error);
      return false;
    }
  }

  async signOut(): Promise<boolean> {
    try {
      return true;
      this.token = '';
    } catch (error) {
      this.token = '';
      console.log('Signout failed.' + error);
      return false;
    }
  }


  isAuthenticated(): Promise<boolean>|boolean {
    return this.token !== '';
  }

  getToken() {
    return this.token;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  makeIntentionalError() {
    return this.http.get('not/a/real/url').pipe(catchError(this.handleError));
  }
}
