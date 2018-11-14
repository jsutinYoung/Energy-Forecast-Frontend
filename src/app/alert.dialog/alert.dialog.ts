import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { IAlertData } from '../service/alert.service';

@Component({
  selector: 'app-inner-dialog',
  templateUrl: 'alert.dialog.html',
  styleUrls: ['./alert.dialog.css']
})

// tslint:disable-next-line:component-class-suffix
export class AlertDialog {
  constructor(
    public dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: IAlertData
  ) {}

  onDismiss(): void {
    this.dialogRef.close();
  }
}
