//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Data} from '@angular/router';

import {ICanCompDeactivate, OPBtype} from '../guard/can-deactivate.guard';


@Component({
  selector: 'app-dash',
  templateUrl: './dash.comp.html',
  styleUrls: ['./dash.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class DashComp implements ICanCompDeactivate, OnInit, OnDestroy {
  constructor(private route: ActivatedRoute) {

    // get param associate with the route.
    this.route.data.subscribe(
        (data: Data) => {
            // data['key'].message;
        });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  allowDeactivate(): OPBtype {
    // if (confirm(
    //         'You have unsaved changes! If you leave, your changes will
    //         belost.')) {
    //   return true;
    // } else {
    //   return false;
    // };

    // check if there are unsave tasks.
    return true;
  }
}
