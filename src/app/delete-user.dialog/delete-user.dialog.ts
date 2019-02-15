import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { retry } from 'rxjs/operators';
import { TokenService } from '../service/token.service';
import { MatSnackBar } from '@angular/material';

import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-delete-user-dialog',
  templateUrl: 'delete-user.dialog.html',
  styleUrls: ['./delete-user.dialog.css']
})

// tslint:disable-next-line:component-class-suffix
export class DeleteUserDialog {
  private DeleteUserURL = null;

  emailFormControl = new FormControl(
    '',
    Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])
  );

  passFormControl2 = new FormControl('', [Validators.required, Validators.minLength(6)]);

  constructor(
    public dialogRef: MatDialogRef<DeleteUserDialog>,
    private http: HttpClient,
    private tokenService: TokenService,
    private snackBar: MatSnackBar
  ) {
    this.DeleteUserURL = tokenService.baseURL + '/users/delete/';
  }

  private openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, { duration: 2000 });
  }

  isWrong(): boolean {
    return this.emailFormControl.invalid;
  }

  async onDone(email) {
    const { status: st, description: desc } = await this.delete(email);
    if (st) {
      this.dialogRef.close();
      this.openSnackBar('Delete succeeded', '');
    } else {
      this.openSnackBar('Delete failed', desc);
    }
  }

  async delete(email: string): Promise<{ status; description }> {
    try {
      if (!this.tokenService.isAuthenticated()) {
        return { status: false, description: 'Un-authenticated' };
      }

      const headers = new HttpHeaders({
        'content-type': 'application/json'
      });

      if (email === this.tokenService.userID) {
        return { status: false, description: 'Canot delete self' };
      }

      const result = await this.http
        .delete(this.DeleteUserURL + email, { headers: headers })
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
