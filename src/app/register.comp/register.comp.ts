//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';
import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
// import {FormControl, FormGroupDirective, NgForm, Validators} from
// '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
// import { NgxSpinnerService } from 'ngx-spinner';

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
  userTypes = ['Analyst', 'Manager'];

  constructor(
    public dialogRef: MatDialogRef<RegisterComp>,
    authService: AuthService,
    router: Router,
    snackBar: MatSnackBar,
    @Inject(SESSION_STORAGE)  storage: StorageService
  ) {
    super(authService, router, snackBar, storage);
    this.isRegisterMode = true;
  }

  onDismiss(): void {
    this.dialogRef.close();
  }

  async onDone(result) {
    const { type, user, pass} = result;
    const ok = await this.signUp(type, user, pass);
    if (ok) {
      this.dialogRef.close();
    }
  }
}
