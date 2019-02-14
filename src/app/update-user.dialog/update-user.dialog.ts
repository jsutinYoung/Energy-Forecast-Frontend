import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { retry } from 'rxjs/operators';
import { TokenService } from '../service/token.service';
import { MatSnackBar } from '@angular/material';

import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-user-dialog',
  templateUrl: 'update-user.dialog.html',
  styleUrls: ['./update-user.dialog.css']
})

// tslint:disable-next-line:component-class-suffix
export class UpdateUserDialog {
  private UpdateUserURL = null;

  passFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
    // Validators.maxLength(12),
  ]);

  passFormControl2 = new FormControl('', [Validators.required, Validators.minLength(6)]);

  constructor(
    public dialogRef: MatDialogRef<UpdateUserDialog>,
    private http: HttpClient,
    private tokenService: TokenService,
    private snackBar: MatSnackBar
  ) {
    this.UpdateUserURL = tokenService.baseURL + '/users/update';
  }

  private openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, { duration: 2000 });
  }

  isWrong(): boolean {
    return (
      this.passFormControl.invalid ||
      this.passFormControl2.invalid ||
      this.passFormControl.value != this.passFormControl2.value
    );
  }

  async onDone(pass) {
    const { status: st, description: desc } = await this.update(pass);
    if (st) {
      this.dialogRef.close();
      this.openSnackBar('Update succeeded', '');
    } else {
      this.openSnackBar('Update failed', desc);
    }
  }

  async update(password: string): Promise<{ status; description }> {
    try {
      if (!this.tokenService.isAuthenticated()) {
        return { status: false, description: 'Un-authenticated' };
      }

      const headers = new HttpHeaders({
        'content-type': 'application/json'
      });

      const email = this.tokenService.userID;
      const body = { email: email, update: { password: password } };
      const result = await this.http
        .put(this.UpdateUserURL, body, { headers: headers })
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

  onDismiss(): void {
    this.dialogRef.close();
  }
}
