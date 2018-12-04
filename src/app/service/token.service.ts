import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';
import * as jwtdecode from 'jwt-decode';
import { PlatformLocation } from '@angular/common';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'user_token';
const USER_TYPE_KEY = 'user_type';
const USERID_KEY = 'user_id';

@Injectable({ providedIn: 'root' })
export class TokenService {
  baseURL = '';
  constructor(
    @Inject(SESSION_STORAGE) private storage: StorageService,
    platformLocation: PlatformLocation
  ) {
    // console.log((platformLocation as any).location);
    // console.log((platformLocation as any).location.href);
    // console.log((platformLocation as any).location.origin);

    if (environment.production) {
      this.baseURL = (platformLocation as any).location.origin;
    } else {
      const loc = (platformLocation as any).location;
      this.baseURL = loc.protocol + '//' + loc.hostname + environment.port;
    }
  }

  isAuthenticated(): Promise<boolean> | boolean {
    const token = this.storage.get(TOKEN_KEY);
    return token !== null;
  }

  get userToken() {
    return this.storage.get(TOKEN_KEY);
  }

  set userToken(token: string) {
    this.storage.set(TOKEN_KEY, token);
  }

  get userID() {
    return this.storage.get(USERID_KEY);
  }

  set userID(email: string) {
    this.storage.set(USERID_KEY, email);
  }

  get userType() {
    const ut = this.storage.get(USER_TYPE_KEY);
    if (ut) {
      return ut;
    } else {
      const token = this.userToken;
      const obj = jwtdecode(token);
      // console.log(obj);
      const { exp, e, user_type } = obj;
      this.storage.set(USER_TYPE_KEY, user_type);
      return user_type;
    }
  }

  invalidateToken() {
    this.storage.set(TOKEN_KEY, null);
    this.storage.set(USER_TYPE_KEY, null);
    this.storage.set(USERID_KEY, null);
  }
}
