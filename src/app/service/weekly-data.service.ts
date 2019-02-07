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

import { ITabularRow } from '../comp-js.comp/chart-js.comp';
import { TokenService } from './token.service';
// import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WeeklyDataService {
  private forecastURL = '';
  private loadURL = '';
  // ?start=2018-10-01T00:00:00&end=2018-10-07T23:00:00

  private forecast: number[] = [];
  private load: number[] = [];
  private hours: Date[] = [];
  private stderr: number[] = [];
  private temperature: number[] = [];
  private theDate: Date;

  @Output() dataChange = new EventEmitter<{ status; description }>();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // this.URL = tokenService.baseURL + '/forecasts/comparisons';
    this.forecastURL = tokenService.baseURL + '/forecasts';
    this.loadURL = tokenService.baseURL + '/loads';
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

  getForecast(): number[] {
    return this.forecast;
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
      return f + f * this.stderr[i];
    });
  }

  getLowError(): number[] {
    return this.forecast.map((e, i) => {
      const f = this.forecast[i];
      return f - f * this.stderr[i];
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
          temp = parseFloat(this.temperature[i].toFixed(2));
        } catch (err) {
          temp = null;
        }

        // may be optional
        let load;
        try {
          load = parseFloat(this.load[i].toFixed(3));
        } catch (err) {
          load = null;
        }

        return {
          date: this.formatDate(this.hours[i], true),
          forecast: parseFloat(e.toFixed(3)),
          load: load,
          stderr: parseFloat((this.stderr[i] * 100).toFixed(2)),
          temperature: temp
        };
      } else {
        return {
          date: null,
          forecast: null,
          load: null,
          stderr: null,
          temperature: null
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
        // start proessing
        const rdata = data.reduceRight((acc, e) => {
          acc.push(e);
          return acc;
        }, []);

        // GMT+01:00
        this.hours = rdata.map(e => {
          // console.log(e[0]);
          const h: Date = moment(e[0]).toDate();
          // console.log(h);
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
    const lURL = this.loadURL + '?start=' + begintext + '&end=' + endtext + '&local=1';
    const data = await this.http
      .get(lURL, { headers: headers })
      .pipe(retry(3))
      .toPromise();

    if (data['status'] === 'fail') {
      return; // ok to silently ignore
    }

    if (Array.isArray(data) && data.length > 0 && data.length <= 168) {
      // start proessing
      const rdata = data.reduceRight((acc, e) => {
        acc.push(e);
        return acc;
      }, []);

      // GMT+01:00
      this.load = rdata.map(e => {
        // console.log(e[0]);
        return e[1];
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
        this.dataChange.emit({ status: false, description: 'Un-authenticated' });
        return { status: false, description: 'Un-authenticated' };
      }

      // read the main forecast data
      const gen_date = moment(date).format('YYYY-MM-DDTHH:mm:ss');
      const fURL = this.forecastURL + '?gen_date=' + gen_date + '&local=1';
      const data = await this.http
        .get(fURL, { headers: headers })
        .pipe(retry(3))
        .toPromise();

      if (data['status'] === 'fail') {
        this.dataChange.emit({ status: false, description: data['reason'] });
        return of({ status: false, description: data['reason'] }).toPromise();
      }

      if (Array.isArray(data) && data.length > 0) {
        // start proessing
        const rdata = data.reduceRight((acc, e) => {
          acc.push(e);
          return acc;
        }, []);

        // GMT+01:00
        this.hours = rdata.map(e => {
          const h: Date = moment(e[0]).toDate();
          return h;
        });
        this.load = null;
        this.forecast = rdata.map(e => {
          return e[1];
        });
        this.stderr = rdata.map(e => {
          return e[2];
        });

        // optional temperature
        try {
          this.temperature = rdata.map(e => {
            return e[3];
          });
        } catch (err) {}

        this.theDate = date; // keep track chosen date
        this.readLoad(date, headers); // read load if any

        this.dataChange.emit({ status: true, description: '' });
        return of({ status: true, description: '' }).toPromise();
      } else {
        this.dataChange.emit({ status: false, description: 'Data not found' });
        return of({ status: false, description: 'Data not found' }).toPromise();
      }
    } catch (error) {
      // todo for backword compatibility need to remove
      return this.legacyRead(date, headers);

      this.dataChange.emit({ status: false, description: error.message });
      return of({ status: false, description: error.message }).toPromise();
    }
  }

  get chosenDate(): Date {
    return this.theDate;
  }
}
