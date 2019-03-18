//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Injector, Output } from '@angular/core';
import * as moment from 'moment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TokenService } from './token.service';
// import { environment } from '../../environments/environment';

export interface ITabularRow {
  date: string;
  forecast: number;
  load: number;
  stderr: number;
  temperature: number;
}

export interface ITabularRow24 {
  date: string;
  load: number;
  d_1: number;
  d_1_err: number;
  d_6: number;
  d_6_err: number;
}

const toFixedNumber = (toFixTo = 2, base = 10) => num => {
  const pow = Math.pow(base, toFixTo);
  return +(Math.round(num * pow) / pow);
};

@Injectable({ providedIn: 'root' })
export class WeeklyDataService {
  private forecastURL = '';
  private loadURL = '';
  // ?start=2018-10-01T00:00:00&end=2018-10-07T23:00:00

  private hours: Date[] = [];
  private forecast: number[] = [];
  private load: number[] = [];
  private stderr: number[] = [];
  private temperature: number[] = [];
  private theDate: Date;
  private dailyPeak: number[] = [7];
  private dailyAverage: number[] = [7];
  private dailyTempPeak: number[] = [7];
  private dailyTempAverage: number[] = [7];

  // comparison data
  private hour_24: Date[] = [];
  private load_24: number[] = [];
  private d_6_24: number[] = [];
  private d_1_24: number[] = [];
  private d_6_24_err: number[] = [];
  private d_1_24_err: number[] = [];
  private theDate24: Date;

  @Output() dataChange = new EventEmitter<{ status; description }>();
  @Output() dataChange2 = new EventEmitter<{ status; description }>();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // this.URL = tokenService.baseURL + '/forecasts/comparisons';
    this.forecastURL = tokenService.baseURL + '/demand/forecast';
    this.loadURL = tokenService.baseURL + '/demand';
  }

  fillDefaultData(date: Date) {
    let m = moment(date);
    for (let i = 1; i <= 7; i++) {
      for (let h = 0; h <= 23; h++) {
        // const time = m.format('YYYY-MM-DDTHH:mm:ss');
        // console.log(time);
        this.hours.push(new Date(m.toDate()));
        this.load.push(null);
        this.forecast.push(null);
        this.stderr.push(null);
        this.temperature.push(null);

        m = m.add(1, 'hour');
      }
    }
  }

  getHours(): Date[] {
    return this.hours;
  }

  getMinHour(): Date {
    return this.hours[0];
  }

  getMaxHour(): Date {
    return this.hours[this.hours.length - 1];
  }

  get24Hour(): Date {
    return this.hours[23];
  }

  get48Hour(): Date {
    return this.hours[47];
  }

  getHoursText(): string[] {
    return this.hours.map(e => {
      return this.formatDate(e);
    });
  }

  private formatDate(d: Date, isYear = false) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();

    let hourText: string;
    if (hour > 9) {
      hourText = `${hour}:00`;
    } else {
      hourText = `0${hour}:00`;
    }

    if (isYear) {
      return `${month}/${day}/${year}--${hourText}`;
    } else {
      return `${month}/${day}--${hourText}`;
    }
  }
  getDailyPeak(index): number {
    return this.dailyPeak[index];
  }

  getDailyAverage(index): number {
    return this.dailyAverage[index];
  }

  getDailyTempPeak(index): number {
    return this.dailyTempPeak[index];
  }

  getDailyTempAverage(index): number {
    return this.dailyTempAverage[index];
  }

  getForecast(): number[] {
    return this.forecast;
  }

  getStdErr(): number[] {
    return this.stderr;
  }

  getLoad(): number[] {
    return this.load;
  }

  getDiff(): number[] {
    return this.forecast.map((e, i) => {
      return e - this.load[i];
    });
  }

  getZeros(): number[] {
    return this.forecast.map(e => {
      return 0.0;
    });
  }

  getHighError(): number[] {
    return this.forecast.map((e, i) => {
      const f = this.forecast[i];
      return toFixedNumber(3)(f + f * this.stderr[i]);
    });
  }

  getLowError(): number[] {
    return this.forecast.map((e, i) => {
      const f = this.forecast[i];
      return toFixedNumber(3)(f - f * this.stderr[i]);
    });
  }

  getTemperature(): number[] {
    return this.temperature;
  }

  getTabularData(): ITabularRow[] {
    const result = this.forecast.map((e, i) => {
      if (e) {
        // may be optional
        let temp;
        try {
          temp = this.temperature[i];
        } catch (err) {
          temp = null;
        }

        // may be optional
        let load;
        try {
          load = this.load[i];
        } catch (err) {
          load = null;
        }

        return {
          date: moment(this.hours[i]).format('YYYY-MM-DD HH:mm'),
          forecast: e,
          stderr: toFixedNumber(2)(this.stderr[i] * 100),
          temperature: temp,
          load: load
        };
      } else {
        return {
          date: null,
          forecast: null,
          stderr: null,
          temperature: null,
          load: null
        };
      }
    });

    return result;
  }

  hasData(): boolean {
    return this.hours.length > 0;
  }

  hasLoad(): boolean {
    return this.load && this.load.length > 0;
  }

  // todo this is legacy code need to remove
  async legacyRead(date: Date, headers: HttpHeaders) {
    // old style
    try {
      const begin = moment(date);
      const begintext = begin.format('YYYY-MM-DDTHH:mm:ss');
      const end = begin.clone().add(7, 'day');
      const endtext = end.format('YYYY-MM-DDTHH:mm:ss');
      const URL = this.tokenService.baseURL + '/forecasts/comparisons';
      const modifiedURL = URL + '?start=' + begintext + '&end=' + endtext;
      const data = await this.http
        .get(modifiedURL, { headers: headers })
        .pipe(retry(3))
        .toPromise();

      if (data['status'] === 'fail') {
        this.dataChange.emit({ status: false, description: data['reason'] });
        return of({ status: false, description: data['reason'] }).toPromise();
      }

      if (Array.isArray(data) && data.length > 0) {

        const rdata = data.reverse();

        this.hours = rdata.map(e => {
          const h: Date = moment(e[0]).toDate();
          return h;
        });
        this.load = rdata.map(e => {
          return e[1];
        });
        this.forecast = rdata.map(e => {
          return e[2];
        });
        this.stderr = rdata.map(e => {
          return e[3];
        });

        // todo remove this when backend is ready
        try {
          this.temperature = rdata.map(e => {
            return e[4];
          });
        } catch (err) {}

        this.theDate = date;
        this.dataChange.emit({ status: true, description: '' });

        return of({ status: true, description: '' }).toPromise();
      } else {
        this.dataChange.emit({ status: false, description: 'Data not found' });
        return of({ status: false, description: 'Data not found' }).toPromise();
      }
    } catch (error) {
      this.dataChange.emit({ status: false, description: error.message });
      return of({ status: false, description: error.message }).toPromise();
    }
  }

  async readLoad(date: Date, headers: HttpHeaders) {
    // now try the load data if any
    const begin = moment(date);
    const begintext = begin.format('YYYY-MM-DDTHH:mm:ss');
    const end = begin.clone().add(6, 'day');
    end.add(23, 'hour');
    const endtext = end.format('YYYY-MM-DDTHH:mm:ss');
    const lURL = this.loadURL + '?start_date=' + begintext + '&end_date=' + endtext;
    const data = await this.http
      .get(lURL, { headers: headers })
      .pipe(retry(3))
      .toPromise();

    if (data['status'] === 'fail') {
      return; // ok to silently ignore
    }

    if (Array.isArray(data) && data.length > 0 && data.length <= 168) {

      const rdata = data.reverse();

      this.load = rdata.map(e => {
        try {
          return toFixedNumber(3)(e[1]);
        } catch (err) {
          return null;
        }
      });
    }
  }

  async fetchWeeklyData(date: Date) {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
      // Token: 'Bearer ' + this.tokenService.userToken
    });

    try {
      if (!this.tokenService.isAuthenticated()) {
        this.dataChange.emit({
          status: false,
          description: 'Un-authenticated'
        });
        return { status: false, description: 'Un-authenticated' };
      }

      // make sure no time portion
      date = moment(date)
        .startOf('day')
        .toDate();

      // read the main forecast data
      const gen_date = moment(date).format('YYYY-MM-DDTHH:mm:ss');
      const fURL = this.forecastURL + '?forecast_date=' + gen_date;
      const data = await this.http
        .get(fURL, { headers: headers })
        .pipe(retry(3))
        .toPromise();

      if (data['status'] === 'fail') {
        this.dataChange.emit({ status: false, description: data['reason'] });
        return of({ status: false, description: data['reason'] }).toPromise();
      }

      if (Array.isArray(data) && data.length > 0) {

        const rdata = data.reverse();

        this.hours = rdata.map(e => {
          const h: Date = moment(e[0]).toDate();
          return h;
        });
        this.load = null;
        this.forecast = rdata.map(e => {
          try {
            return toFixedNumber(3)(e[1]);
          } catch (err) {
            return null;
          }
        });
        this.stderr = rdata.map(e => {
          try {
            return toFixedNumber(3)(e[2]);
          } catch (err) {
            return null;
          }
        });

        // calculate daily peak
        try {
          let hrCount = 0;
          const start = moment(this.hours[0]);
          for (let i = 0; i < 7; i++) {
            start.add(1, 'day');
            let peak = 0;
            let sum = 0;
            let hrCountPerDay = 0;
            while (this.hours[hrCount] < start.toDate()) {
              if (this.forecast[hrCount] > peak) {
                peak = this.forecast[hrCount];
              }
              sum += this.forecast[hrCount];
              hrCount++;
              hrCountPerDay++;
            }
            this.dailyPeak[i] = peak;
            this.dailyAverage[i] = sum / hrCountPerDay;
          }
        } catch (err) {}

        // optional temperature
        try {
          this.temperature = rdata.map(e => {
            try {
              return toFixedNumber(2)(e[3]);
            } catch (err) {
              return null;
            }
          });

          // if there are temperature
          let hrCount = 0;
          const start = moment(this.hours[0]);
          for (let i = 0; i < 7; i++) {
            start.add(1, 'day');
            let peak = 0;
            let sum = 0;
            let hrCountPerDay = 0;
            while (this.hours[hrCount] < start.toDate()) {
              if (this.temperature[hrCount] > peak) {
                peak = this.temperature[hrCount];
              }
              sum += this.temperature[hrCount];
              hrCount++;
              hrCountPerDay++;
            }
            this.dailyTempPeak[i] = peak;
            this.dailyTempAverage[i] = sum / hrCountPerDay;
          }

        } catch (err) {}

        this.theDate = date; // keep track chosen date
        await this.readLoad(date, headers); // read load if any

        this.dataChange.emit({ status: true, description: '' });
        return of({ status: true, description: '' }).toPromise();
      } else {
        this.dataChange.emit({ status: false, description: 'Data not found' });
        return of({ status: false, description: 'Data not found' }).toPromise();
      }
    } catch (error) {
      // todo for backword compatibility need to remove
      return await this.legacyRead(date, headers);

      this.dataChange.emit({ status: false, description: error.message });
      return of({ status: false, description: error.message }).toPromise();
    }
  }

  triggerReload() {
    this.dataChange.emit({ status: true, description: '' });
    return of({ status: true, description: '' }).toPromise();
  }

  get chosenDate(): Date {
    return this.theDate;
  }

  // Fetch load24 ....................................................................

  async load24(start_date: Date, end_date: Date, headers: HttpHeaders) {
    // read the main forecast data
    const start_date_txt = moment(start_date).format('YYYY-MM-DDTHH:mm:ss');
    const end_date_txt = moment(end_date).format('YYYY-MM-DDTHH:mm:ss');

    const fURL =
      this.loadURL + '?start_date=' + start_date_txt + '&end_date=' + end_date_txt;

    const data = await this.http
      .get(fURL, { headers: headers })
      .pipe(retry(3))
      .toPromise();

    return data;
  }
  // Fetch forcast 24 ....................................................................
  async http24(gen_date: Date, start_date: Date, end_date: Date, headers: HttpHeaders) {
    // read the main forecast data
    const gen_date_txt = moment(gen_date).format('YYYY-MM-DDTHH:mm:ss');
    const start_date_txt = moment(start_date).format('YYYY-MM-DDTHH:mm:ss');
    const end_date_txt = moment(end_date).format('YYYY-MM-DDTHH:mm:ss');

    const fURL =
      this.forecastURL +
      '?forecast_date=' +
      gen_date_txt +
      '&start_date=' +
      start_date_txt +
      '&end_date=' +
      end_date_txt;

    const data = await this.http
      .get(fURL, { headers: headers })
      .pipe(retry(3))
      .toPromise();

    return data;
  }

  async fetch24Data(date: Date) {
    const headers = new HttpHeaders({
      'content-type': 'application/json'
    });

    try {
      if (!this.tokenService.isAuthenticated()) {
        this.dataChange2.emit({
          status: false,
          description: 'Un-authenticated'
        });
        return { status: false, description: 'Un-authenticated' };
      }

      // read the chosen day load 24
      let data = await this.load24(
        date,
        moment(date)
          .add(23, 'hour')
          .toDate(),
        headers
      );

      // main data not present
      if (data['status'] === 'fail') {
        this.dataChange2.emit({ status: false, description: data['reason'] });
        return of({ status: false, description: data['reason'] }).toPromise();
      }

      if (Array.isArray(data) && data.length > 0 && data.length <= 25) {

        let rdata = data.reverse();

        this.hour_24 = rdata.map(e => {
          const h: Date = moment(e[0]).toDate();
          return h;
        });
        this.load_24 = rdata.map(e => {
          return toFixedNumber(3)(e[1]);
        });

        this.theDate24 = date; // keep track chosen date

        // optional data d-6 days, last 24 hrs
        data = await this.http24(
          moment(date)
            .add(-6, 'day')
            .toDate(),
          date,
          moment(date)
            .add(23, 'hour')
            .toDate(),
          headers
        );
        if (Array.isArray(data) && data.length > 0 && data.length <= 25) {

          rdata = data.reverse();

          this.d_6_24 = rdata.map(e => {
            return toFixedNumber(3)(e[1]);
          });

          this.d_6_24_err = rdata.map(e => {
            return e[2];
          });
        }

        // optional data d-1 day, last 24 hrs
        data = await this.http24(
          moment(date)
            .add(-1, 'day')
            .toDate(),
          date,
          moment(date)
            .add(23, 'hour')
            .toDate(),
          headers
        );
        if (Array.isArray(data) && data.length > 0 && data.length <= 25) {

          rdata = data.reverse();

          this.d_1_24 = rdata.map(e => {
            return toFixedNumber(3)(e[1]);
          });

          this.d_1_24_err = rdata.map(e => {
            return e[2];
          });
        }

        this.dataChange2.emit({ status: true, description: '' });
        return of({ status: true, description: '' }).toPromise();
      } else {
        this.dataChange2.emit({ status: false, description: 'Data not found' });
        return of({ status: false, description: 'Data not found' }).toPromise();
      }
    } catch (error) {
      this.dataChange2.emit({ status: false, description: error.message });
      return of({ status: false, description: error.message }).toPromise();
    }
  }

  getHour24(): Date[] {
    return this.hour_24;
  }
  geLoad24(): number[] {
    return this.load_24;
  }
  getD624(): number[] {
    return this.d_6_24;
  }
  getD124(): number[] {
    return this.d_1_24;
  }

  hasData24(): boolean {
    return this.hour_24.length > 0;
  }

  getTabularData24(): ITabularRow24[] {
    const result = this.load_24.map((e, i) => {
      if (e) {
        // may be optional
        let d_1;
        try {
          d_1 = this.d_1_24[i];
        } catch (err) {
          d_1 = null;
        }

        let d_1_err;
        try {
          d_1_err = toFixedNumber(2)(this.d_1_24_err[i] * 100);
        } catch (err) {
          d_1_err = null;
        }

        let d_6;
        try {
          d_6 = this.d_6_24[i];
        } catch (err) {
          d_6 = null;
        }

        let d_6_err;
        try {
          d_6_err = toFixedNumber(2)(this.d_6_24_err[i] * 100);
        } catch (err) {
          d_6_err = null;
        }

        return {
          date: moment(this.hour_24[i]).format('YYYY-MM-DD HH:mm'),
          load: toFixedNumber(3)(e),
          d_1: d_1,
          d_1_err: d_1_err,
          d_6: d_6,
          d_6_err: d_6_err
        };
      } else {
        return {
          date: null,
          load: null,
          d_1: null,
          d_1_err: null,
          d_6: null,
          d_6_err: null
        };
      }
    });

    return result;
  }

  get chosenDate24(): Date {
    return this.theDate24;
  }
}
