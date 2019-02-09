//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service';

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

  passFormControl2 = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
  ]);

  // matcher = new MyErrorStateMatcher();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
  }

  async signUp(
    type: string,
    email: string,
    password: string,
    password2: string
  ) {
    try {
      if (password !== password2) {
        this.openSnackBar('Register failed', 'verify password!');
      } else {
        // this.spinner.show();
        const { status, description } = await this.authService.signupUser(
          type,
          email,
          password
        );
        if (status === true) {
          this.openSnackBar('Register succeeded', 'Can login.');
          // this.spinner.hide();
          return true;
        } else {
          this.openSnackBar('Registration failed.', description);
        }
      }
    } catch (error) {
      // console.log('Register failed' + error);
      this.openSnackBar('Registration failed', error);
    }
    return false;
  }

  isOK(): boolean {
    if (this.isRegisterMode) {
      return (
        this.passFormControl.invalid ||
        this.emailFormControl.invalid ||
        this.passFormControl2.invalid
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
      const { status, description } = await this.authService.signIn(
        email,
        password
      );
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
