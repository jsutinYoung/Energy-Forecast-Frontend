import {HttpClient} from '@angular/common/http';
import {HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';
import {Observable, of, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';

export interface Credential {
  email: string;
  password: string;
  token: string;
}

const STORAGE_KEY = 'user_token';

@Injectable({providedIn: 'root'})
export class AuthService {
  // private token = '';
  private SigninURL = 'http://localhost:8000/oauth/login';
  private SignupURL = 'http://localhost:8000/users/create';

  constructor(
      private http: HttpClient,
      @Inject(SESSION_STORAGE) private storage: StorageService) {}

  async signupUser(email: string, password: string):
      Promise<{status; description}> {
    try {
      if (!this.isAuthenticated()) {
        return {status: false, description: 'Un-authenticated'};
      }

      // this.token =
      //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDgyMjM4MzQsImVtYWlsIjoiYWRtaW4iLCJ1c2VyX3R5cGUiOjF9.WfnlLKLSBJH7Hu6jIaoQQjgbOsvTlve_PpRp5LhcX0o';

      const headers = new HttpHeaders({
        'content-type': 'application/json',
        'Token': 'Bearer ' + this.getToken()
      });

      // console.log(this.getToken());
      // headers.append('Token', 'Bearer ' + this.token);

      const body = {user: {email: email, password: password, user_type: 3}};
      const result =
          await this.http.post(this.SignupURL, body, {headers: headers})
              .pipe(retry(3))
              .toPromise();

      if (result['status'] !== 'ok') {
        return of({status: false, description: result['description']})
            .toPromise();
      }

      return of({status: true, description: ''}).toPromise();
    } catch (err) {
      // console.log(error);
      // console.log('Sign up user failed.' + error);
      return of({status: false, description: err.error.reason}).toPromise();
    }
  }

  async signIn(email: string, password: string):
      Promise<{status; description}> {
    try {
      // this.token = '';
      const headers = new HttpHeaders().set('content-type', 'application/json');
      const body = {user: {email: email, password: password}};

      const result =
          await this.http.post(this.SigninURL, body, {headers: headers})
              .pipe(
                  retry(3)  // retry a failed request up to 3 times
                  // catchError(this.handleError)  // then handle the error
                  )
              .toPromise();

      if (!(result['Token'] && result['Token'].length > 0)) {
        return of({status: false, description: result['description']})
            .toPromise();
      }

      const token = result['Token'];
      this.storage.set(STORAGE_KEY, token);

      // console.log(this.getToken());
      // console.log(this.token);
      return of({status: true, description: ''}).toPromise();
    } catch (err) {
      // console.error(error);
      return of({status: false, description: err.error.reason}).toPromise();
    }
  }

  signOut() {
    // this.token = null;
    this.storage.set(STORAGE_KEY, null);
  }

  isAuthenticated(): Promise<boolean>|boolean {
    const token = this.storage.get(STORAGE_KEY);
    return token !== null;
  }

  getToken() {
    // return this.token;
    return this.storage.get(STORAGE_KEY);
  }

  // private async stall(stallTime = 3000) {
  //   await new Promise(resolve => setTimeout(resolve, stallTime));
  // }
}
