import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { AlertService, IAlertData } from '../service/alert.service';

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

  constructor(public alertService: AlertService) {

  }

  ngOnInit() {
    this.tabularDataSource = new MatTableDataSource<IAlertData>(
      this.alertService.get()
    );

    this.tabularDataSource.sort = this.sort;
    this.tabularDataSource.paginator = this.paginator;
  }

  ngOnDestroy() {}

  onAlert(event: MouseEvent) {
    console.log(event);
  }

  refetch() {}
}
