import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-about-dialog',
  templateUrl: 'about.dialog.html',
  styleUrls: ['./about.dialog.css']
})

// tslint:disable-next-line:component-class-suffix
export class AboutDialog {
  constructor(
    public dialogRef: MatDialogRef<AboutDialog>
    // @Inject(MAT_DIALOG_DATA) public data: IAlertData
  ) {}

  onDismiss(): void {
    this.dialogRef.close();
  }
}
