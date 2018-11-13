import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {AlertService} from '../service/alert.service';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.comp.html',
  styleUrls: ['./drawer.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class DrawerComp implements OnInit, OnDestroy {
  @Output() test = new EventEmitter<{name: string; status: string}>();

  forecasts = [];

  constructor(public alerts: AlertService, private route: ActivatedRoute) {
    this.forecasts.push('Jan');
    this.forecasts.push('Feb');
    this.forecasts.push('Mar');
    this.forecasts.push('Apr');

    // this.logger.log('drawerComp created');
  }

  ngOnInit() {
    this.route.params.subscribe(
        (params: Params) => {
            // this.logger.log(params['id']);
        });
  }

  ngOnDestroy() {
    // this.logger.log('drawerComp OnDestroy');
  }

  onAlert(event: MouseEvent) {
    console.log(event);
  }
  onForecast(event: MouseEvent) {}
}
