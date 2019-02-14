import { Component, Input, OnInit } from '@angular/core';
import { DailyFabAnimations } from './daily-fab-animation';
import { WeeklyDataService } from '../service/weekly-data.service';
import { StatetService } from '../service/state.service';
import * as moment from 'moment';

@Component({
  selector: 'app-daily-fab',
  templateUrl: './daily-fab.comp.html',
  styleUrls: ['./daily-fab.comp.scss'],
  animations: DailyFabAnimations
})
// tslint:disable-next-line:component-class-suffix
export class DailyFabComp implements OnInit {
  @Input() options;
  @Input() isDisabled;

  buttons = [];
  fabTogglerState = 'inactive';

  constructor(private dataService: WeeklyDataService, private state: StatetService) {}

  ngOnInit() {
    const maxButtons = 6;
    if (this.options.buttons.length > maxButtons) {
      this.options.buttons.splice(5, this.options.buttons.length - maxButtons);
    }
  }

  showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.options.buttons;
  }

  hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  goto(date: string) {
    const day = moment(date, 'MM-DD-YYYY');
    this.state.singleForecast.dayPointer = new Date(day.toDate());
    this.state.singleForecast.zoomLevel = 1;
    this.dataService.triggerReload();
    this.state.singleForecast.isResetMinMax = true;
  }
}
