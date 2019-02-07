//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Data, Params} from '@angular/router';


@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.comp.html',
  styleUrls: ['./error-page.comp.css']
})
// tslint:disable-next-line:component-class-suffix
export class ErrorPageComp implements OnInit, OnDestroy {
  errorMessage: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.errorMessage = this.route.snapshot.data['message'];
    this.route.data.subscribe((data: Data) => {
      this.errorMessage = data['message'];
      console.log(this.errorMessage);
    });
  }

  ngOnDestroy() {
    // this.logger.log('ErrorPageComp OnDestroy');
  }
}
