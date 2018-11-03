import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Data } from '@angular/router';

import { ICanCompDeactivate, OPBtype } from '../guard/can-deactivate.guard';
import { WeeklyDataService } from '../service/weekly-data.service';

@Component({
  selector: 'app-dummy',
  templateUrl: './dummy.comp.html',
  styleUrls: ['./dummy.comp.css'],
  encapsulation: ViewEncapsulation.None
})
// tslint:disable-next-line:component-class-suffix
export class DummyComp implements ICanCompDeactivate, OnInit, OnDestroy {
  errorMessage: string;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dataService: WeeklyDataService
  ) {
    // this.logger.log('DummyComp created');

    this.route.data.subscribe((data: Data) => {
      this.errorMessage = data['key'].message;
    });
  }

  ngOnInit() {}

  ngOnDestroy() {}

  allowDeactivate(): OPBtype {
    if (
      confirm(
        'You have unsaved changes! If you leave, your changes will belost.'
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  public openSnackBar(message: string, action: string) {
    // this.snackBar.open(message, action, {duration: 2000});
    this.snackBar.open(message, action, { duration: 2000 });
  }

  public testHttpGet() {
    this.dataService.testHttpGet();
  }
}
