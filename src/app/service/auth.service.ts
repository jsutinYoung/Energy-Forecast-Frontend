import { HttpClient } from '@angular/common/http';
import {
  HttpHeaders
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { WeeklyDataService } from '../service/weekly-data.service';
import * as moment from 'moment';
import {TokenService} from '../service/token.service';

export enum UserType {
  admin = 1,
  manager = 2,
  analyst = 3
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  userType: UserType;
  private SigninURL = 'http://localhost:8000/oauth/login';
  private SignupURL = 'http://localhost:8000/users/create';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private dataService: WeeklyDataService
  ) {}

  async signupUser(
    type: string,
    email: string,
    password: string
  ): Promise<{ status; description }> {
    try {
      if (!this.tokenService.isAuthenticated()) {
        return { status: false, description: 'Un-authenticated' };
      }

      const headers = new HttpHeaders({
        'content-type': 'application/json',
        Token: 'Bearer ' + this.tokenService.getToken()
      });

      let typeIndex = 3;
      switch (type) {
        case 'Analyst':
          typeIndex = 3;
          break;
        case 'Manager':
          typeIndex = 2;
          break;
        case 'Admin':
          typeIndex = 1;
          break;
        default:
          typeIndex = 3;
      }

      const body = {
        user: { email: email, password: password, user_type: typeIndex }
      };
      const result = await this.http
        .post(this.SignupURL, body, { headers: headers })
        .pipe(retry(3))
        .toPromise();

      if (result['status'] !== 'ok') {
        return of({
          status: false,
          description: result['description']
        }).toPromise();
      }

      return of({ status: true, description: '' }).toPromise();
    } catch (err) {
      // console.log(error);
      // console.log('Sign up user failed.' + error);
      return of({ status: false, description: err.error.reason }).toPromise();
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ status; description }> {
    try {
      // this.token = '';
      const headers = new HttpHeaders().set('content-type', 'application/json');
      const body = { user: { email: email, password: password } };

      const result = await this.http
        .post(this.SigninURL, body, { headers: headers })
        .pipe(
          retry(3) // retry a failed request up to 3 times
          // catchError(this.handleError)  // then handle the error
        )
        .toPromise();

      if (!(result['Token'] && result['Token'].length > 0)) {
        return of({
          status: false,
          description: result['description']
        }).toPromise();
      }

      const token = result['Token'];
      this.tokenService.setToken(token);
      this.userType = this.tokenService.getUserType();

      // before we return, fetch default weekly data
      // const d = moment('2018-11-20').toDate();
      // const r = await this.dataService.fetchWeeklyData(d);
      // console.log(r);

      return of({ status: true, description: '' }).toPromise();
    } catch (err) {
      // console.error(error);
      return of({ status: false, description: err.error.reason }).toPromise();
    }
  }

  signOut() {
    this.tokenService.invalidateToken();
  }


  // private async stall(stallTime = 3000) {
  //   await new Promise(resolve => setTimeout(resolve, stallTime));
  // }
}
