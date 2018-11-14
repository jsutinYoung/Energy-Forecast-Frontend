import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TableDataSource, ValidatorService } from 'angular4-material-table';

import { AlertValidatorService } from './alert-validator.service';
import { Alert } from './alert';

@Component({
  selector: 'app-alert-list',
  providers: [
    {provide: ValidatorService, useClass: AlertValidatorService }
  ],
  templateUrl: './alert-list.comp.html',
  styleUrls: ['./alert-list.comp.scss']
})
// tslint:disable-next-line:component-class-suffix
export class AlertListComp implements OnInit {

  constructor(private personValidator: ValidatorService) { }

  displayedColumns = ['name', 'age', 'actionsColumn'];

  @Input() alertList = [
    { name: 'Mark', age: 15 },
    { name: 'Brad', age: 50 },
    ] ;
  @Output() listChange = new EventEmitter<Alert[]>();

  dataSource: TableDataSource<Alert>;


  ngOnInit() {
    this.dataSource = new TableDataSource<any>(this.alertList, Alert, this.personValidator);

    this.dataSource.datasourceSubject.subscribe(list => this.listChange.emit(list));
  }
}

