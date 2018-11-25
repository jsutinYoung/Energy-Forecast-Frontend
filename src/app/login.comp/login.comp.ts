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
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { AuthService } from '../service/auth.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-login.comp',
  templateUrl: './login.comp.html',
  styleUrls: ['./login.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class LoginComp implements OnInit {
  isSigUpOpen = false;
  // oauth
  userProfile: object;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

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
    private snackBar: MatSnackBar,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    // this.passFormControl.valueChanges.subscribe(
    //   (v) => { console.log(v); console.log(this.passFormControl.errors);}
    // );
  }

  ngOnInit() {}

  // Google Firebase
  async signInUp(
    type: string,
    email: string,
    password: string,
    password2: string
  ) {
    try {
      if (password !== password2) {
        this.openSnackBar('Register failed', 'verify password!');
      } else {
        this.spinnerService.show();
        const { status, description } = await this.authService.signupUser(
          type,
          email,
          password
        );
        if (status === true) {
          this.openSnackBar('Register succeeded', 'Can login.');
          this.spinnerService.hide();
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
    if (this.isSigUpOpen) {
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
    this.spinnerService.hide();
    this.snackBar.open(message, action, { duration: 2000 });
  }

  async signIn(email: string, password: string) {
    try {
      this.spinnerService.show();
      const { status, description } = await this.authService.signIn(
        email,
        password
      );
      if (status === true) {
        this.router.navigate(['/dash']);
        this.spinnerService.hide();
        return true;
      } else {
        this.openSnackBar('Signed in failed', description);
      }
    } catch (error) {
      this.openSnackBar('Signed in failed', error);
    }

    return false;
  }
}
