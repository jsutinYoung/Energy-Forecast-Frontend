import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';
import * as jwtdecode from 'jwt-decode';

const STORAGE_KEY = 'user_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) {}

  isAuthenticated(): Promise<boolean> | boolean {
    const token = this.storage.get(STORAGE_KEY);
    return token !== null;
  }

  getToken() {
    // return this.token;
    return this.storage.get(STORAGE_KEY);
  }

  setToken(token: string) {
    this.storage.set(STORAGE_KEY, token);
  }

  invalidateToken() {
    this.storage.set(STORAGE_KEY, null);
  }

  getUserType() {
    const token = this.getToken();
    const obj = jwtdecode(token);
    // console.log(obj);
    const { exp, e, user_type } = obj;
    return user_type;
  }
}
