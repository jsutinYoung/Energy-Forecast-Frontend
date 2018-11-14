import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

import {AlertDialog} from '../alert.dialog/alert.dialog';
import {AlertService, IAlertData} from '../service/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.comp.html',
  styleUrls: ['./alert.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class AlertComp implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tabularDataSource: MatTableDataSource<IAlertData>;
  displayedColumns: string[] = ['type', 'title', 'message'];

  currentAlert: IAlertData;

  constructor(public alertService: AlertService, public dialog: MatDialog) {}

  ngOnInit() {
    this.tabularDataSource =
        new MatTableDataSource<IAlertData>(this.alertService.get());

    this.tabularDataSource.sort = this.sort;
    this.tabularDataSource.paginator = this.paginator;
  }

  ngOnDestroy() {}

  refetch() {}

  applyFilter(filterValue: string) {
    this.tabularDataSource.filter = filterValue.trim().toLowerCase();
  }

  onSelectRow(row, event) {
    if (row) {
      this.openDialog(row, event.clientX, event.clientY);
    }
  }

  openDialog(row: IAlertData, x, y): void {
    const dialogRef =
        this.dialog.open(AlertDialog, {maxWidth: '300px', data: row});

    dialogRef.updatePosition({top: y + 'px', left: x + 'px'});
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      console.log(result);
      // this.id = result;
    });
  }
}
