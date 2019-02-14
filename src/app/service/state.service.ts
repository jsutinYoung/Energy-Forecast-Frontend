//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';
import * as jwtdecode from 'jwt-decode';
import { PlatformLocation } from '@angular/common';
import { environment } from '../../environments/environment';

export interface ISingleForecastState {
  zoomLevel: number;
  chartType: string;
  hasTemp: boolean;
  isTableOpen: boolean;
  dayPointer: Date;
  isResetMinMax: boolean;
}

export interface ICompareForecastState {
  isTableOpen: boolean;
}

@Injectable({ providedIn: 'root' })
export class StatetService {
  singleForecast: ISingleForecastState;
  compareForecast: ICompareForecastState;
  currentTab = 0;

  constructor() {
    this.compareForecast = { isTableOpen: false };
    this.singleForecast = {
      zoomLevel: 4,
      chartType: 'stderr',
      hasTemp: false,
      isTableOpen: false,
      dayPointer: null,
      isResetMinMax: false
    };
  }
}
