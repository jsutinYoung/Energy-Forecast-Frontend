import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
// import {FormControl, FormGroupDirective, NgForm, Validators} from
// '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { LoginComp } from '../login.comp/login.comp';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-register.comp',
  templateUrl: './register.comp.html',
  styleUrls: ['./register.comp.css']
})
// tslint:disable-next-line:component-class-suffix
export class RegisterComp extends LoginComp {
  // thisDialog: RegisterComp;
  userTypes = ['Analyst', 'Manager', 'Admin'];

  constructor(
    public dialogRef: MatDialogRef<RegisterComp>,
    authService: AuthService,
    router: Router,
    snackBar: MatSnackBar,
    spinnerService: Ng4LoadingSpinnerService
  ) {
    super(authService, router, snackBar, spinnerService);
    this.isSigUpOpen = true;
    // this.thisDialog = this;
  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  async onDone(result) {
    const { type, user, pass, pass2 } = result;
    const ok = await this.signInUp(type, user, pass, pass2);
    if (ok) {
      this.dialogRef.close();
    }
  }
}
