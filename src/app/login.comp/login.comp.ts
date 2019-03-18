//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service';

const MINUTES_UNITL_AUTO_LOGOUT = 15; // in mins
const CHECK_INTERVAL = 1000; // in ms
const STORE_KEY = 'lastAction';

/** Error when invalid control is dirty, touched, or submitted. */
// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(
//     control: FormControl | null,
//     form: FormGroupDirective | NgForm | null
//   ): boolean {
//     const isSubmitted = form && form.submitted;
//     return !!(
//       control &&
//       control.invalid &&
//       (control.dirty || control.touched || isSubmitted)
//     );
//   }
// }

@Component({
  selector: 'app-login.comp',
  templateUrl: './login.comp.html',
  styleUrls: ['./login.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class LoginComp implements OnInit {
  isRegisterMode = false;

  // emailFormControl3 = new FormControl('', [
  //   Validators.required,
  //   Validators.email
  // ]);

  emailFormControl = new FormControl(
    '',
    Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])
  );

  passFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
    // Validators.maxLength(12),
  ]);

  passFormControl2 = new FormControl('', [Validators.required, Validators.minLength(6)]);

  // matcher = new MyErrorStateMatcher();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(SESSION_STORAGE) private storage: StorageService
  ) {
    if (!this.isRegisterMode) {
      this.check();
      this.initListener();
      this.initInterval();
    }
  }

  ngOnInit() { }

  get lastAction() {
    return parseInt(this.storage.get(STORE_KEY), 10);
  }

  set lastAction(value) {
    this.storage.set(STORE_KEY, value);
  }

  private initListener() {
    document.body.addEventListener('click', () => this.reset());
  }

  private reset() {
    this.lastAction = Date.now();
  }

  private initInterval() {
    setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }

  private check() {
    const now = Date.now();
    const timeleft = this.lastAction + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;

    if (isTimeout && this.authService.isAuthenticated()) {
      this.authService.signOut();
      this.router.navigate(['/']);
    }
  }


  async signUp(type: string, email: string, password: string) {
    try {
      // if (password !== password2) {
      //   this.openSnackBar('Register failed', 'verify password!');
      // } else {
      const { status, description } = await this.authService.signupUser(type, email, password);
      if (status === true) {
        this.openSnackBar('Register succeeded', 'Can login.');
        // this.spinner.hide();
        return true;
      } else {
        this.openSnackBar('Registration failed.', description);
      }
      // }
    } catch (error) {
      // console.log('Register failed' + error);
      this.openSnackBar('Registration failed', error);
    }
    return false;
  }

  isWrong(): boolean {
    if (this.isRegisterMode) {
      return (
        this.emailFormControl.invalid ||
        this.passFormControl.invalid ||
        this.passFormControl2.invalid ||
        this.passFormControl.value !== this.passFormControl2.value
      );
    } else {
      return this.passFormControl.invalid || this.emailFormControl.invalid;
    }
  }

  private openSnackBar(message: string, action: string) {
    // this.spinner.hide();
    this.snackBar.open(message, action, { duration: 2000 });
  }

  async signIn(email: string, password: string) {
    try {
      // this.spinner.show();
      const { status, description } = await this.authService.signIn(email, password);
      if (status === true) {
        // this.spinner.hide();
        this.router.navigate(['/dash']);
        return true;
      } else {
        this.openSnackBar('Signed in failed', description);
      }

      // this.authService.signIn(email, password);
    } catch (error) {
      this.openSnackBar('Signed in failed', error);
    }

    return false;
  }
}
