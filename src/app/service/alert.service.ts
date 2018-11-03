import {EventEmitter, Injectable} from '@angular/core';

// @Injectable({ providedIn: 'root' })

enum AlertType {
  urgent = 'urgent',
  warning = 'warning',
  announcement = 'announcement',
  info = 'info',
}

interface AlertData {
  type: AlertType;
  message: string;
}

export class AlertService {
  notifier = new EventEmitter<AlertData>();

  private list: AlertData[] = [
    {type: AlertType.urgent, message: 'Extremely dangerous'},
    {type: AlertType.warning, message: 'Abnormal weather'},
    {type: AlertType.announcement, message: 'Friday celerbration'},
    {type: AlertType.info, message: 'Info FYI'},
  ];

  constructor() {}

  get(): AlertData[] {
    return this.list;
  }

  add(alert: AlertData) {
    this.notifier.emit(alert);
  }

  // getColor(type: string) {
  //   switch (type) {
  //     case 'urgent':
  //       return 'warn';
  //     case 'warning':
  //       return 'orange';
  //     case 'annoucement':
  //       return 'primary';
  //     case 'info':
  //       'accent';
  //       return;
  //   }
  // }
}
