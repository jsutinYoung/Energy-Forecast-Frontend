//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import _ from 'lodash';
import * as moment from 'moment';

import { WeeklyDataService } from '../service/weekly-data.service';
import { StatetService } from '../service/state.service';

export interface ITabularRow24 {
  date: string;
  load: number;
  d_1: number;
  d_1_err: number;
  d_6: number;
  d_6_err: number;
  // temperature: number;
}

@Component({
  selector: 'app-hist-chart',
  templateUrl: './hist-chart.comp.html',
  styleUrls: ['./hist-chart.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class HistComp implements OnInit, OnDestroy, AfterViewInit {
  static readonly title = 'Forecast On ';

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private chart: Chart;
  private hasRadius = true;

  tabularDataSource: MatTableDataSource<ITabularRow24>;
  displayedColumns: string[] = ['date', 'load', 'd_1', 'd_1_err', 'd_6', 'd_6_err'];
  isTableOpen = false;

  // make sure today's day is not selectable as there is no load
  dateFilter = (d: Date): boolean => {
    const now = moment()
      .startOf('day')
      .toDate();
    return d >= now ? false : true;
  }

  constructor(
    private dataService: WeeklyDataService,
    private snackBar: MatSnackBar,
    private state: StatetService
  ) {}

  ngOnInit() {
    this.isTableOpen = this.state.compareForecast.isTableOpen;

    this.dataService.dataChange2.subscribe(result => {
      if (result.status === true) {
        this.reDrawChart();
      } else {
        this.openSnackBar('Fetch 24hr data failed', result.description);
        // this.router.navigate(['/']);
      }
    });

    if (!this.dataService.hasData24()) {
      // const d = moment('2018-11-20').toDate();
      this.dataService.fetch24Data(
        moment() // set it to yesterday to have load
          .add(-1, 'day')
          .startOf('day')
          .toDate()
      );
    } else {
      this.dataService.dataChange2.emit({ status: true, description: '' });
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    // console.log('destroy');
    this.state.compareForecast.isTableOpen = this.isTableOpen ;
  }

  private reDrawChart() {
    this.displayLine();

    // take care of table
    this.tabularDataSource = new MatTableDataSource(this.dataService.getTabularData24());
    this.tabularDataSource.sort = this.sort;
    this.tabularDataSource.paginator = this.paginator;
  }

  private configCompare(): {} {
    const myoptions = {
      animationEasing: 'easeInOutQuart',
      animation: { duration: '100' },
      responsive: true,
      title: {
        display: true,
        text: HistComp.title,
        fontColor: 'white',
        fontSize: 13
      },
      scales: {
        xAxes: [
          {
            gridLines: { color: 'rgba(255,255,255, 0.3)' },
            type: 'time',
            distribution: 'series',
            time: { displayFormats: { hour: 'MMM D|HH:mm' }, unit: 'hour' },

            ticks: {
              fontColor: '#C0C0C0',
              fontSize: 11
            },
            scaleLabel: {
              display: true,
              labelString: 'Date & Hours',
              fontSize: 12,
              fontColor: '#C0C0C0'
            }
          }
        ],
        yAxes: [
          {
            gridLines: {
              color: 'rgba(255,255,255, 1)'
              // tickMarkLength: 45
            },
            scaleLabel: {
              display: true,
              labelString: 'Electricity (MWa)',
              fontSize: 13,
              fontColor: '#C0C0C0'
            },
            ticks: { fontColor: '#C0C0C0', fontSize: 11 }
          }
        ]
      },
      layout: { padding: { left: 20, right: 0, top: 20, bottom: 20 } },
      legend: {
        display: true,
        position: 'bottom',
        labels: { fontColor: 'white' }
      },
      tooltips: { displayColors: 'true' }
    };

    // const tempAxis = this.getTempAxis();
    // if (tempAxis) {
    //   myoptions.scales.yAxes.push(tempAxis);
    // }

    const config = {
      type: 'line',
      data: { labels: this.dataService.getHour24(), datasets: [] },
      options: myoptions
    };

    return config;
  }
  private configDataset() {
    const dataset0 = {
      label: 'Chosen Day Load',
      data: this.dataService.geLoad24(),
      // pointRadius: 3,
      backgroundColor: '',
      borderColor: 'rgba(92, 240, 155, 1)',
      pointBackgroundColor: 'rgba(92, 240, 155, 1)',
      pointHoverBackgroundColor: 'rgba(92, 240, 155, 1)',
      pointHoverBorderColor: 'white'
    };

    const dataset1 = {
      label: '-1 Day Forecast',
      data: this.dataService.getD124(),
      // pointRadius: 3,

      backgroundColor: '',
      borderColor: 'rgba(5, 206, 250,1)',
      pointBackgroundColor: 'rgba(5, 206, 250,1)',
      pointHoverBackgroundColor: 'rgba(5, 206, 250,1)',
      pointHoverBorderColor: 'white'
    };

    const dataset2 = {
      label: '-6 Day Forecast',
      data: this.dataService.getD624(),
      // pointRadius: 3,

      backgroundColor: '',
      borderColor: 'yellow',
      pointBackgroundColor: 'yellow',
      pointHoverBackgroundColor: 'yellow',
      pointHoverBorderColor: 'white'
    };

    const yDatasets = [dataset0, dataset1, dataset2];

    return yDatasets;
  }

  displayLine() {
    this.refresh(this.configCompare());
    this.chart.config.data.datasets = this.configDataset();
    const ds = this.chart.config.data.datasets;
    // if (this.hasTemperature()) {
    //   ds.push(this.getTempDataset());
    // }

    this.setMarker(this.hasRadius);
    this.chart.config.data.datasets[0].backgroundColor = '';
    this.chart.config.data.datasets[1].backgroundColor = '';

    // const {
    //   scales: { xAxes }
    // } = this.chart.options;
    // xAxes[0].gridLines = '';

    const optionalLegend = {
      display: true,
      position: 'bottom',
      labels: {
        fontColor: 'white',
        filter: function(legendItem, chartData) {
          if (legendItem.datasetIndex === 0) {
            legendItem.fillStyle = 'rgba(92, 240, 155, 1)';
            return true;
          } else if (legendItem.datasetIndex === 1) {
            legendItem.fillStyle = 'rgba(5, 206, 250,1)';
            return true;
          } else if (legendItem.datasetIndex === 2) {
            legendItem.fillStyle = 'yellow';
            return true;
          } else if (legendItem.datasetIndex === 3) {
            legendItem.fillStyle = 'orange';
            return true;
          } else {
            return false;
          }
        }
      }
    };

    this.chart.config.options.legend = optionalLegend;

    const m = moment(this.dataService.chosenDate24);
    this.chart.config.options.title.text =
      HistComp.title + '\u27f9 ' + m.format('MM-DD-YYYY ( ddd )');

    const m2 = m.clone().add(23, 'hour');

    this.chart.options.scales.xAxes[0].scaleLabel.labelString = `${m.format(
      '(ddd) MM-DD-YYYY HH:mm'
    )}  \u27fa  ${m2.format('(ddd) MM-DD-YYYY HH:mm')}`;

    this.refresh();
  }

  toggleMarker() {
    this.hasRadius = !this.hasRadius;
    this.setMarker(this.hasRadius);
    this.refresh();
  }

  hasMarker(): boolean {
    return this.hasRadius;
  }

  hasLoad(): boolean {
    return this.dataService.hasLoad();
  }

  private setMarker(hasRadius: boolean) {
    if (!hasRadius) {
      this.chart.config.data.datasets[0].pointRadius = 0;
      this.chart.config.data.datasets[1].pointRadius = 0;
      this.chart.config.data.datasets[2].pointRadius = 0;
    } else {
      this.chart.config.data.datasets[0].pointRadius = 4;
      this.chart.config.data.datasets[1].pointRadius = 4;
      this.chart.config.data.datasets[2].pointRadius = 4;
    }
  }

  private openSnackBar(message: string, action: string) {
    // this.spinner.hide();
    this.snackBar.open(message, action, { duration: 2000 });
  }

  async fetchDataOn(aDate?: Date) {
    if (!aDate) {
      aDate = this.dataService.chosenDate24;
    }

    const ok = await this.dataService.fetch24Data(aDate);
    if (ok.status === true) {
    } else {
      this.openSnackBar('Refresh data failed', ok.description);
      // to do need to differntiate error message
      // this.router.navigate(['/']);
    }
  }

  private refresh(cfg?: any) {
    const opt = {
      onClick: (event: any, active: Array<any>) => {
        event.stopPropagation();
        // this.onChartClick({ event, active });
      }
    };

    let config = {};
    if (!cfg) {
      config = {
        type: this.chart.config.type,
        data: this.chart.data,
        options: _.merge(this.chart.options, opt)
      };
    } else {
      config = {
        type: cfg.type,
        data: cfg.data,
        options: _.merge(cfg.options, opt)
      };
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('hist-canvas', config);
  }

  disableToggleMarker() {
    return false;
  }

  pickDate(control, event) {
    const chosen = moment(event.value).startOf('day');
    this.fetchDataOn(chosen.toDate());
  }

  toggleTable() {
    this.isTableOpen = !this.isTableOpen;
  }

  // temperature stuff
  // hasTemperature(): boolean {
  //   if (!this.dataService.hasData24() || this.dataService.getTemperature24().length === 0) {
  //     return false;
  //   }

  //   if (!this.chart || !this.chart.options) {
  //     return false;
  //   }

  //   return this.chart.options.scales.yAxes.length === 2;
  // }

  // private getTempAxis() {
  //   let tempAxis;
  //   try {
  //     const yAxes = this.chart.options.scales.yAxes;
  //     tempAxis = this.hasTemperature() ? yAxes[1] : null;
  //   } catch (err) {
  //     tempAxis = null;
  //   }
  //   return tempAxis;
  // }

  // private getTempDataset() {
  //   const dataset = {
  //     yAxisID: '_ID_TEMP',
  //     label: '°F',
  //     data: this.dataService.getTemperature24(),
  //     pointRadius: 2,
  //     backgroundColor: '',
  //     borderColor: 'orange',
  //     pointHoverBackgroundColor: 'orange',
  //     pointBorderColor: 'orange'
  //   };

  //   return dataset;
  // }

  // togleTemperature() {
  //   const yAxes = this.chart.options.scales.yAxes;

  //   if (this.hasTemperature()) {
  //     // remove the temp y-axis
  //     for (let i = 0; i < yAxes.length; i++) {
  //       const ax = yAxes[i];
  //       if (ax.id === '_ID_TEMP') {
  //         yAxes.splice(i, 1);
  //       }
  //     }
  //     // remove dataset
  //     const ds = this.chart.config.data.datasets;
  //     for (let i = 0; i < ds.length; i++) {
  //       const d = ds[i];
  //       if (d.yAxisID === '_ID_TEMP') {
  //         ds.splice(i, 1);
  //       }
  //     }
  //   } else {
  //     // add temp y-aix
  //     const axis = {
  //       id: '_ID_TEMP',
  //       type: 'linear',
  //       position: 'right',
  //       scaleLabel: {
  //         display: true,
  //         labelString: 'Temperature °F',
  //         fontSize: 12,
  //         fontColor: 'orange'
  //       },
  //       ticks: { fontColor: '#C0C0C0', fontSize: 10, min: 0 }
  //     };
  //     yAxes.push(axis);

  //     // add temp dataset
  //     this.chart.config.data.datasets.push(this.getTempDataset());
  //   }

  //   this.refresh();
  // }
}
