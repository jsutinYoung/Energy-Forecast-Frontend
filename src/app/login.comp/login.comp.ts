import {Component, EventEmitter, OnInit} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {Router} from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';
import {Ng4LoadingSpinnerService} from 'ng4-loading-spinner';

import {AuthService} from '../service/auth.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl|null, form: FormGroupDirective|NgForm|null):
      boolean {
    const isSubmitted = form && form.submitted;
    return !!(
        control && control.invalid &&
        (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login.comp',
  templateUrl: './login.comp.html',
  styleUrls: ['./login.comp.css']
  // encapsulation: ViewEncapsulation.None
})

// tslint:disable-next-line:component-class-suffix
export class LoginComp implements OnInit {

  isSigUpOpen = false;
  // oauth
  userProfile: object;

  emailFormControl =
      new FormControl('', [Validators.required, Validators.email]);

  passFormControl = new FormControl('', [
    Validators.required, Validators.minLength(6)
    // Validators.maxLength(12),
  ]);

  passFormControl2 = new FormControl('', [
    Validators.required, Validators.minLength(6)
    // Validators.maxLength(12),
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(
      private authService: AuthService, private oauthService: OAuthService,
      private router: Router, private snackBar: MatSnackBar,
      private spinnerService: Ng4LoadingSpinnerService) {
    // this.passFormControl.valueChanges.subscribe(
    //   (v) => { console.log(v); console.log(this.passFormControl.errors);}
    // );

    this.oauthService.configure({
      // Url of the Identity Provider
      // issuer: 'https://steyer-identity-server.azurewebsites.net/identity',
      issuer: 'http://localhost',

      // URL of the SPA to redirect the user to after login
      redirectUri: window.location.origin + '/index.html/',

      // URL of the SPA to redirect the user after silent refresh
      silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

      // The SPA's id. The SPA is registerd with this id at the auth-server
      clientId: 'demo-resource-owner',

      dummyClientSecret: 'geheim',

      // set the scope for the permissions the client should request
      // The first three are defined by OIDC. The 4th is a usecase-specific one
      scope: 'openid profile email voucher',

      showDebugInformation: true,

      oidc: false
    });
    this.oauthService.loadDiscoveryDocument();
  }

  ngOnInit() {}

  // Google Firebase
  async signInUp(email: string, password: string, password2: string) {
    if (this.isSigUpOpen) {
      // sign-up
      try {
        if (password !== password2) {
          this.openSnackBar('Register failed', 'verify password!');
        } else {
          this.spinnerService.show();
          const ok = await this.authService.signupUser(email, password);
          if (ok) {
            this.openSnackBar('Register succeeded', 'Re-login.');
          } else {
            this.openSnackBar('Register failed User conflict.', 'Re-try!');
          }
        }
      } catch (error) {
        console.log('Register failed' + error);
        this.openSnackBar('Register failed', 'Exception!');
      }
    } else {
      // sign-in
      this.login(email, password);
      return;

      try {
        this.spinnerService.show();
        const ok = await this.authService.signIn(email, password);
        if (ok) {
          this.router.navigate(['/dash']);
        } else {
          this.openSnackBar('Signed in failed', 'Wrong user/password!');
        }
      } catch (error) {
        this.openSnackBar('Signed in failed', 'Exception!');
        console.log('sign in user failed:' + error);
      }
    }
  }

  isOK(): boolean {
    if (this.isSigUpOpen) {
      return (
          this.passFormControl.invalid || this.emailFormControl.invalid ||
          this.passFormControl2.invalid);
    } else {
      return this.passFormControl.invalid || this.emailFormControl.invalid;
    }
  }

  private openSnackBar(message: string, action: string) {
    this.spinnerService.hide();
    this.snackBar.open(message, action, {duration: 2000});
  }

  // Oauth version
  loadUserProfile(): void {
    this.oauthService.loadUserProfile().then(up => (this.userProfile = up));
  }

  get accessToken() {
    return this.oauthService.getAccessToken();
  }

  get accessTokenExpiration() {
    return new Date(this.oauthService.getAccessTokenExpiration())
        .toLocaleDateString();
  }

  get givenName() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims['given_name'];
  }

  get familyName() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims['family_name'];
  }

  login(email: string, password: string) {
    this.router.navigate(['/dash']);
    return;

    // dot use  OpenID here
    this.oauthService
        .fetchTokenUsingPasswordFlowAndLoadUserProfile('max', 'geheim')
        .then(() => {
          console.log('successfully logged in');
          console.log(this.accessToken);
          this.router.navigate(['/dash']);
        })
        .catch(err => {
          console.error('error logging in', err);
          this.openSnackBar('Signed in failed', 'Wrong user/password!');
        });
  }
}
