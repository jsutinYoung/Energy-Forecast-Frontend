import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ITabularRow } from '../comp-js.comp/chart-js.comp';
import { WEEK_DATA } from '../data/week_data';

@Injectable({ providedIn: 'root' })
export class WeeklyDataService {
  // weekData: { hour: Date; baseline: number; forecast: number }[] = [];

  forecast: number[];
  baseline: number[];
  hours: Date[];
  stderr: number[];

  constructor(private http: HttpClient) {
    //   this.weekData = WEEK_DATA.map(e => {
    //     const h: Date = new Date(Date.parse(e[0]));
    //     const b: number = e[1];
    //     const f: number = e[2];
    //     return {hour: h, baseline: b, forecast: f};
    //   });
    this.hours = WEEK_DATA.map(e => {
      const h: Date = new Date(Date.parse(e[0]));
      return h;
    });
    this.baseline = WEEK_DATA.map(e => {
      return e[1];
    });
    this.forecast = WEEK_DATA.map(e => {
      return e[2];
    });
    this.stderr = WEEK_DATA.map(e => {
      return e[3];
    });
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

  ge48Hour(): Date {
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

  // setForecast(data: number[]) {
  //   console.log(data);

  //   this.forecast = data;
  // }

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

  public randomize(): void {
    const temp = this.forecast.map(e => {
      return Math.floor(Math.random() * 100 + 1) + 22000;
    });

    const temp2 = this.forecast.map(e => {
      return Math.floor(Math.random() * 100 + 1) + 22000;
    });

    this.forecast = temp;
    this.baseline = temp2;

    this.stderr = this.forecast.map(e => {
      return Math.random() / 10.0 + 0.01;
    });
  }

  testHttpGet() {
    this.http
      .get('http://localhost:4200/assets/dummy.json')
      .subscribe(
        response => console.log(response),
        error => console.log(error)
      );
  }

  getTabularData(startDate: Date): ITabularRow[] {
    const result = this.forecast.map((e, i) => {
      return {
        date: this.formatDate(this.hours[i], true),
        forecast: parseFloat(e.toFixed(3)),
        baseline: parseFloat(this.baseline[i].toFixed(3)),
        stderr: parseFloat((this.stderr[i] * 100).toFixed(2))
      };
    });

    return result;
  }
}
