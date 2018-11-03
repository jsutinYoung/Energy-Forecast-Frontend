import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {WEEK_DATA} from '../data/week_data';

@Injectable({providedIn: 'root'})
export class WeeklyDataService {
  // weekData: { hour: Date; baseline: number; forecast: number }[] = [];

  forecast: number[];
  baseline: number[];
  hours: Date[];

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
  }

  // get(): { hour: Date; baseline: number; forecast: number }[] {
  //   return this.weekData;
  // }

  // get2() {
  //   return WEEK_DATA;
  // }

  getHours(): Date[] {
    return this.hours;
  }

  getMinHour(): Date {
    return this.hours[0];
  }

  getMaxHour(): Date {
    return this.hours[this.hours.length - 1];
  }

  getFirstEndDayHour(): Date {
    return this.hours[23];
  }

  getHoursText(): string[] {
    return this.hours.map(e => {
      const month = e.getMonth() + 1;
      const day = e.getDate();
      const hour = e.getHours();

      let hourText: string;
      if (hour > 9) {
        hourText = `${hour}:00`;
      } else {
        hourText = `0${hour}:00`;
      }

      return `${month}/${day} ${hourText}`;
    });
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

  // setBaseline(data: number[]) {
  //   this.baseline = data;
  // }

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

  public randomize(): void {
    const temp = this.forecast.map(e => {
      return Math.floor(Math.random() * 100 + 1) + 22000;
    });

    const temp2 = this.forecast.map(e => {
      return Math.floor(Math.random() * 100 + 1) + 22000;
    });

    this.forecast = temp;
    this.baseline = temp2;
  }

  testHttpGet() {
    this.http.get('http://localhost:4200/assets/dummy.json')
        .subscribe(
            response => console.log(response), error => console.log(error));
  }
}
