//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { PlatformLocation } from '@angular/common';
import { Injectable, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { retry } from 'rxjs/operators';
import { TokenService } from '../service/token.service';
// import { environment } from '../../environments/environment';

export enum UserType {
  admin = 1,
  manager = 2,
  analyst = 3
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private SigninURL = null;
  private SignupURL = null;

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // console.log(this.tokenService.baseURL);
    this.SigninURL = tokenService.baseURL + '/oauth/login';
    this.SignupURL = tokenService.baseURL + '/users/create';
  }

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
        // Token: 'Bearer ' + this.tokenService.userToken
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
      return of({ status: false, description: err.error.reason }).toPromise();
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ status; description }> {
    try {
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
      this.tokenService.userToken = token;
      this.tokenService.userID = email;

      return of({ status: true, description: '' }).toPromise();
    } catch (err) {
      return of({ status: false, description: err.error.reason }).toPromise();
    }
  }

  signOut() {
    this.tokenService.invalidateToken();
  }

  get userType(): UserType {
    return this.tokenService.userType;
  }

  get userID(): string {
    return this.tokenService.userID;
  }
  // private async stall(stallTime = 3000) {
  //   await new Promise(resolve => setTimeout(resolve, stallTime));
  // }
}
