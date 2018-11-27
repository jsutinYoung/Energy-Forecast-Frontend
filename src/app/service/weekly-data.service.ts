import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Injector, Output } from '@angular/core';
import * as moment from 'moment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { ITabularRow } from '../comp-js.comp/chart-js.comp';
// import {WEEK_DATA} from '../data/week_data';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class WeeklyDataService {
  private URL = 'http://localhost:8000/forecasts/comparisons';
  // ?start=2018-10-01T00:00:00&end=2018-10-07T23:00:00

  private forecast: number[] = [];
  private baseline: number[] = [];
  private hours: Date[] = [];
  private stderr: number[] = [];

  @Output() dataChange = new EventEmitter<{ status; description }>();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  fillDefaultData(date: Date) {
    let m = moment(date).startOf('week');
    for (let i = 1; i <= 7; i++) {
      for (let h = 0; h <= 23; h++) {
        // const time = m.format('YYYY-MM-DDTHH:mm:ss');
        // console.log(time);
        this.hours.push(new Date(m.toDate()));
        this.baseline.push(null);
        this.forecast.push(null);
        this.stderr.push(null);

        m = m.add(1, 'hour');
      }
      // m = m.add(1, 'day');
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

  getBaseline(): number[] {
    return this.baseline;
  }

  getDiff(): number[] {
    return this.forecast.map((e, i) => {
      return e - this.baseline[i];
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

  getTabularData(startDate: Date): ITabularRow[] {
    const result = this.forecast.map((e, i) => {
      if (e) {
        return {
          date: this.formatDate(this.hours[i], true),
          forecast: parseFloat(e.toFixed(3)),
          baseline: parseFloat(this.baseline[i].toFixed(3)),
          stderr: parseFloat((this.stderr[i] * 100).toFixed(2))
        };
      } else {
        return { date: null, forecast: null, baseline: null, stderr: null };
      }
    });

    return result;
  }

  hasData(): boolean {
    return this.hours.length > 0;
  }
  async fetchWeeklyData(date: Date) {
    // give a date figure out the begin and end date
    try {
      if (!this.tokenService.isAuthenticated()) {
        this.dataChange.emit({
          status: false,
          description: 'Un-authenticated'
        });
        return { status: false, description: 'Un-authenticated' };
      }

      const headers = new HttpHeaders({
        'content-type': 'application/json',
        Token: 'Bearer ' + this.tokenService.userToken
      });

      const begin = moment(date)
        .startOf('week')
        .format('YYYY-MM-DD');

      const end = moment(date)
        .endOf('week')
        .format('YYYY-MM-DD');

      const modifiedURL =
        this.URL + '?start=' + begin + 'T00:00:00&end=' + end + 'T23:00:00';

      // console.log(modifiedURL);

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

        this.hours = rdata.map(e => {
          const h: Date = new Date(Date.parse(e[0]));
          return h;
        });
        this.baseline = rdata.map(e => {
          return e[1];
        });
        this.forecast = rdata.map(e => {
          return e[2];
        });
        this.stderr = rdata.map(e => {
          return e[3];
        });

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
}
