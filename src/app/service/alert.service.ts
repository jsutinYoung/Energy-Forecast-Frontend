import {EventEmitter, Injectable} from '@angular/core';
// const fakeAlertsJson = require('../../assets/testAlert.json');
import * as fakeAlertsJson from '../../assets/testAlert.json';


// @Injectable({ providedIn: 'root' })

enum AlertType {
  urgent = 'urgent',
  warning = 'warning',
  announcement = 'announcement',
  info = 'info'
}

export interface IAlertData {
  type: AlertType;
  id: string;
  time: string;
  title: string;
  message: string;
}

export class AlertService {
  notifier = new EventEmitter<IAlertData>();

  private list: IAlertData[] = fakeAlertsJson.default;

  constructor() {
  }

  get(): IAlertData[] {
    return this.list;
  }

  add(alert: IAlertData) {
    this.notifier.emit(alert);
  }
}
