//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { WeeklyDataService } from '../service/weekly-data.service';
import { StatetService } from '../service/state.service';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class DownloaderService {
  constructor(
    private http: HttpClient,
    private dataService: WeeklyDataService,
    private stateService: StatetService
  ) {}
  // .....................................................................
  createDownload(json, filename) {
    const blob = new Blob([json], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  jsonToCSV(header: string[], json) {
    const csvRows = [];
    const header_txt = header.join(',');
    csvRows.push(header_txt);

    for (const row of json) {
      const row_array = Object.keys(row).map(key => {
        return row[key];
      });
      csvRows.push(row_array.join(','));
    }

    return csvRows.join('\n');
  }

  downloadCSV(currentTab) {
    if (currentTab === 0) {
      const filename =
        'forecast_' + moment(this.dataService.chosenDate).format('YYYY-MM-DD') + '.csv';

      const data = this.dataService.getTabularData().map(row => {
        const rr = {
          hour: '',
          forecast: '',
          stderr: '',
          temperature: '',
          load: ''
        };
        if (row.date) {
          rr.hour = row.date;
          try {
            rr.forecast = row.forecast.toFixed(3);
          } catch (_) {}
          try {
            rr.load = row.load.toFixed(3);
          } catch (_) {}
          try {
            rr.stderr = row.stderr.toFixed(2);
          } catch (_) {}
          try {
            rr.temperature = row.temperature.toFixed(2);
          } catch (_) {}
        }

        return rr;
      });

      const header = ['Date', 'Forecast(WMa)', 'StdErr %', '°F', 'Load(WMa)'];
      const csvData = this.jsonToCSV(header, data);
      this.createDownload(csvData, filename);
    } else {
      const filename =
        'forecasts_' + moment(this.dataService.chosenDate).format('YYYY-MM-DD') + '.csv';
      const data = this.dataService.getTabularData24().map(row => {
        const rr = {
          hour: '',
          load: '',
          forcast_1: '',
          stderr_1: '',
          forcast_6: '',
          stderr_6: ''
        };
        if (row.date) {
          rr.hour = row.date;
          try {
            rr.load = row.load.toFixed(3);
          } catch (_) {}
          try {
            rr.forcast_1 = row.d_1.toFixed(3);
          } catch (_) {}
          try {
            rr.stderr_1 = row.d_1_err.toFixed(2);
          } catch (_) {}
          try {
            rr.forcast_6 = row.d_6.toFixed(3);
          } catch (_) {}
          try {
            rr.stderr_6 = row.d_6_err.toFixed(2);
          } catch (_) {}
        }
        return rr;
      });
      const header = [
        'Date',
        'Load(WMa)',
        'd-1 forecast(WMa)',
        'd-1 StdErr %',
        'd-6 forecast(WMa)',
        'd-6 StdErr %'
      ];
      const csvData = this.jsonToCSV(header, data);
      this.createDownload(csvData, filename);
    }
  }
  // .....................................................................
  // support classic downof file from server, not use now.
  getTextFile(filename: string) {
    // The Observable returned by get() is of type Observable<string>
    // because a text response was specified.
    // There's no need to pass a <string> type parameter to get().
    return this.http.get(filename, { responseType: 'text' }).pipe(
      tap(
        // Log the result or error
        data => this.log(filename, data),
        error => this.logError(filename, error)
      )
    );
  }

  private log(filename: string, data: string) {
    const message = `DownloaderService downloaded "${filename}" and got "${data}".`;
  }

  private logError(filename: string, error: any) {
    const message = `DownloaderService failed to download "${filename}"; got error "${
      error.message
    }".`;
    console.error(message);
    // this.messageService.add(message);
  }
}
