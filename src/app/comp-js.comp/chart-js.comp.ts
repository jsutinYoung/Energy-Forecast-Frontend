import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import _ from 'lodash';
import * as moment from 'moment';

import { WeeklyDataService } from '../service/weekly-data.service';

enum ChartType {
  line = 'line',
  area = 'area',
  stderr = 'stderr',
  delta = 'delta'
}

export interface ITabularRow {
  date: string;
  forecast: number;
  actual: number;
  stderr: number;
  temperature: number;
}

@Component({
  selector: 'app-chart-js',
  templateUrl: './chart-js.comp.html',
  styleUrls: ['./chart-js.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class ChartComp implements OnInit, OnDestroy, AfterViewInit {
  static readonly title = 'NWPCC Energy Demand';

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private fillColor0 = {
    backgroundColor: 'rgba(92, 240, 155, 0.6)',
    borderColor: 'rgba(92, 240, 155, 1)',
    pointBackgroundColor: 'rgba(148,159,177,1)'
  };

  private fillColor1 = {
    backgroundColor: 'rgba(5, 206, 250,0.6)',
    borderColor: 'rgba(5, 206, 250,1)',
    pointBackgroundColor: 'rgba(77,83,96,1)'
  };

  private chart: Chart;
  private xMinMax: { min; max };
  private hasRadius = true;
  private zoomValue = 1;
  private dayPointer: Date;
  type: ChartType;

  tabularDataSource: MatTableDataSource<ITabularRow>;
  displayedColumns: string[] = [
    'date',
    'forecast',
    'actual',
    'stderr',
    'temperature'
  ];
  isTableOpen: boolean;

  constructor(
    private dataService: WeeklyDataService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // console.log('ctor');
  }

  ngOnInit() {
    this.dataService.dataChange.subscribe(result => {
      if (result.status === true) {
        this.reDrawChart();
      } else {
        this.openSnackBar('Fetch weekly data failed', result.description);
        this.router.navigate(['/']);
      }
    });

    if (!this.dataService.hasData()) {
      // const d = moment('2018-11-20').toDate();
      this.dataService.fetchWeeklyData(new Date());
    } else {
      this.dataService.dataChange.emit({ status: true, description: '' });
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    // console.log('destroy');
  }

  private applyFilter(filterValue: string) {
    this.tabularDataSource.filter = filterValue.trim().toLowerCase();
  }

  private reDrawChart() {
    // this.refresh(this.configCompare());
    const d1 = this.dataService.getMinHour();
    // const d2 = this.dataService.get48Hour();
    this.dayPointer = new Date(d1);
    this.zoomValue = 2;
    this.displayStdError();
    this.tabularDataSource = new MatTableDataSource(
      this.dataService.getTabularData()
    );

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
        text: ChartComp.title,
        fontColor: 'white',
        fontSize: 13
      },
      scales: {
        xAxes: [
          {
            gridLines: { color: 'rgba(255,255,255, 0.3)' },
            type: 'time',
            distribution: 'series',
            time: { displayFormats: { hour: 'MMM D - hA' }, unit: 'hour' },

            ticks: {
              fontColor: '#C0C0C0',
              fontSize: 10
              // minor: {
              //   fontColor: 'red'
              // }
              // Include a dollar sign in the ticks
              // callback:
              //     function(value, index, values) {
              //       return '$' + value;
              //     }
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
              fontSize: 12,
              fontColor: '#C0C0C0'
            },
            ticks: { fontColor: '#C0C0C0', fontSize: 10 }
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

    const tempAxis = this.getTempAxis();
    if (tempAxis) {
      myoptions.scales.yAxes.push(tempAxis);
    }

    const config = {
      type: 'line',
      data: { labels: this.dataService.getHours(), datasets: [] },
      options: myoptions
    };

    return config;
  }
  private configCompareDataset() {
    let dataset0 = {
      label: 'Actual',
      data: this.dataService.getBaseline(),
      // pointRadius: 3,

      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    };
    dataset0 = _.merge(dataset0, this.fillColor0);

    let dataset1 = {
      label: 'Forecast',
      data: this.dataService.getForecast(),
      // pointRadius: 3,

      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    };
    dataset1 = _.merge(dataset1, this.fillColor1);

    const yDatasets = [dataset0, dataset1];

    return yDatasets;
  }

  displayLine() {
    if (this.type === ChartType.line) {
      return;
    }

    this.refresh(this.configCompare());
    this.chart.config.data.datasets = this.configCompareDataset();
    const ds = this.chart.config.data.datasets;
    if (this.hasTemperature()) {
      ds.push(this.getTempDataset());
    }
    this.setZoom(this.zoomValue);

    this.type = ChartType.line;
    this.setMarker(this.hasRadius);
    this.chart.config.data.datasets[0].backgroundColor = '';
    this.chart.config.data.datasets[1].backgroundColor = '';

    const {
      scales: { xAxes }
    } = this.chart.options;
    xAxes[0].gridLines = '';

    this.chart.config.type = 'line';
    this.chart.config.options.title.text =
      ChartComp.title + ' \u27f6 Forecast vs Actual';
    this.refresh();
  }

  displayArea() {
    if (this.type === ChartType.area) {
      return;
    }

    this.refresh(this.configCompare());
    this.chart.config.data.datasets = this.configCompareDataset();
    const ds = this.chart.config.data.datasets;
    if (this.hasTemperature()) {
      ds.push(this.getTempDataset());
    }
    this.setZoom(this.zoomValue);

    this.type = ChartType.area;
    this.setMarker(this.hasRadius);
    this.chart.config.data.datasets[0].backgroundColor = this.fillColor0.backgroundColor;
    this.chart.config.data.datasets[1].backgroundColor = this.fillColor1.backgroundColor;

    const {
      scales: { xAxes }
    } = this.chart.options;
    xAxes[0].gridLines = { color: 'rgba(255,255,255, 0.3)' };

    this.chart.config.type = 'line';
    this.chart.config.options.title.text =
      ChartComp.title + ' \u27f6 Forecast vs Actual';
    this.refresh();
  }

  displayDelta() {
    if (this.type === ChartType.delta) {
      return;
    }

    this.refresh(this.configCompare());
    this.chart.config.data.datasets = this.configCompareDataset();
    const ds = this.chart.config.data.datasets;
    if (this.hasTemperature()) {
      ds.push(this.getTempDataset());
    }
    this.setZoom(this.zoomValue);

    this.type = ChartType.delta;
    this.chart.config.options.title.text =
      ChartComp.title + ' \u27f6 Forecast - Actual';

    this.chart.config.type = 'line';
    const isOn = this.hasRadius ? 3 : 0;
    ds[0].data = this.dataService.getZeros();
    ds[0].label = 'Relative Actual';
    ds[0].pointRadius = 0;
    ds[1].data = this.dataService.getDiff();
    ds.label = 'Forecast-Actual';
    ds[1].pointRadius = isOn;

    this.refresh();
  }

  displayStdError() {
    if (this.type === ChartType.stderr) {
      return;
    }

    this.refresh(this.configCompare());
    // this.chart.options.animation.duration = '1000';
    this.chart.config.type = 'line';
    this.type = ChartType.stderr;
    this.chart.config.options.title.text =
      ChartComp.title + ' \u27f6 Forecast & Std Errors';

    const optionalLegend = {
      display: true,
      position: 'bottom',
      labels: {
        fontColor: 'white',
        filter: function(legendItem, chartData) {
          if (legendItem.datasetIndex === 0) {
            legendItem.fillStyle = 'rgba(5, 206, 250,0.6)';
            return true;
          } else if (legendItem.datasetIndex === 3) {
            legendItem.fillStyle = 'rgba(244, 142, 3,0.6)';
            return true;
          } else {
            return false;
          }
        }
      }
    };

    this.chart.config.options.legend = optionalLegend;

    const dsLow = {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderColor: '',
      data: this.dataService.getLowError(),
      label: 'Lower',
      pointRadius: '0',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    };

    const dsHigh = {
      borderColor: '',
      backgroundColor: 'rgba(175, 176, 180, 0.5)',
      data: this.dataService.getHighError(),
      label: 'Higher',
      pointRadius: '0',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    };

    const dsLine = {
      type: 'line',
      label: 'Forecast',
      data: this.dataService.getForecast(),
      pointRadius: '3',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
      backgroundColor: '',
      borderColor: 'rgba(5, 206, 250,0.8)'
    };

    const ds = this.chart.config.data.datasets;
    ds.push(dsLine);
    ds.push(dsLow);
    ds.push(dsHigh);
    if (this.hasTemperature()) {
      ds.push(this.getTempDataset());
    }

    this.setZoom(this.zoomValue);
    this.refresh();
  }

  toggleMarker() {
    this.hasRadius = !this.hasRadius;
    this.setMarker(this.hasRadius);
    this.refresh();
  }

  // temperature stuff
  hasTemperature(): boolean {
    return this.chart.options.scales.yAxes.length === 2;
  }

  hasMarker(): boolean {
    return this.hasRadius;
  }

  private getTempAxis() {
    let tempAxis;
    try {
      const yAxes = this.chart.options.scales.yAxes;
      tempAxis = this.hasTemperature() ? yAxes[1] : null;
    } catch (err) {
      tempAxis = null;
    }
    return tempAxis;
  }

  private getTempDataset() {
    const dataset = {
      yAxisID: '_ID_TEMP',
      label: '°F',
      data: this.dataService.getTemperature(),
      pointRadius: 2,
      pointBorderColor: 'orange',
      backgroundColor: '',
      borderColor: 'orange'
      // pointHoverBackgroundColor: '#fff',
      // pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    };

    return dataset;
  }

  toogleTemperature() {
    const yAxes = this.chart.options.scales.yAxes;

    if (this.hasTemperature()) {
      // remove the temp y-axis
      for (let i = 0; i < yAxes.length; i++) {
        const ax = yAxes[i];
        if (ax.id === '_ID_TEMP') {
          yAxes.splice(i, 1);
        }
      }
      // remove dataset
      const ds = this.chart.config.data.datasets;
      for (let i = 0; i < ds.length; i++) {
        const d = ds[i];
        if (d.yAxisID === '_ID_TEMP') {
          ds.splice(i, 1);
        }
      }
    } else {
      // add temp y-aix
      const axis = {
        id: '_ID_TEMP',
        type: 'linear',
        position: 'right',
        scaleLabel: {
          display: true,
          labelString: 'Temperature °F',
          fontSize: 12,
          fontColor: 'orange'
        },
        ticks: { fontColor: '#C0C0C0', fontSize: 10, min: 0 }
      };
      yAxes.push(axis);

      // add temp dataset
      this.chart.config.data.datasets.push(this.getTempDataset());
    }

    this.refresh();
  }

  formatLabel(value: number | null) {
    if (!value) {
      return '1X';
    }

    switch (value) {
      case 1:
        return '1d';
      case 2:
        return '2d';
      case 3:
        return '4d';
      case 4:
        return '7d';
    }
  }

  setXminMax(d1: Date, d2: Date) {
    if (
      d2 > d1 &&
      d1 >= this.dataService.getMinHour() &&
      d1 <= this.dataService.getMaxHour()
    ) {
      const {
        scales: { xAxes }
      } = this.chart.options;
      xAxes[0].time.min = new Date(d1);
      xAxes[0].time.max = new Date(d2);
      this.xMinMax = { min: new Date(d1), max: new Date(d2) };

      const m1 = moment(d1);
      const m2 = moment(d2);
      // todo need to change later.
      this.chart.options.scales.xAxes[0].scaleLabel.labelString = `${m1.format(
        'MM-DD-YYYY h:mm a'
      )}  to  ${m2.format('MM-DD-YYYY h:mm a')}`;
    }
  }

  reachedRightEnd(): boolean {
    const { min: d1, max: d2 } = this.xMinMax;
    const maxHourTime = this.dataService.getMaxHour().getTime();
    return (<Date>d2).getTime() === maxHourTime;
  }

  reachedLeftEnd(): boolean {
    const { min: d1, max: d2 } = this.xMinMax;
    const minHourTime = this.dataService.getMinHour().getTime();
    return (<Date>d1).getTime() === minHourTime;
  }

  nextDay() {
    // tslint:disable-next-line:prefer-const
    let { min: d1, max: d2 } = this.xMinMax;

    const maxHourTime = this.dataService.getMaxHour().getTime();
    if ((<Date>d2).getTime() === maxHourTime) {
      return;
    }

    d2.setHours(d2.getHours() + 24);
    d1.setHours(d1.getHours() + 24);

    const delta =
      (<Date>d2).getTime() - this.dataService.getMaxHour().getTime();

    if (delta > 0) {
      (<Date>d2).setTime((<Date>d2).getTime() - delta);
      (<Date>d1).setTime((<Date>d1).getTime() - delta);
    }

    this.dayPointer = new Date(d1);
    this.setXminMax(d1, d2);
    this.chart.update();
  }

  previousDay() {
    // tslint:disable-next-line:prefer-const
    let { min: d1, max: d2 } = this.xMinMax;

    const minHourTime = this.dataService.getMinHour().getTime();

    if ((<Date>d1).getTime() === minHourTime) {
      return;
    }

    d2.setHours(d2.getHours() - 24);
    d1.setHours(d1.getHours() - 24);

    const delta = minHourTime - (<Date>d1).getTime();

    if (delta > 0) {
      (<Date>d2).setTime((<Date>d2).getTime() + delta);
      (<Date>d1).setTime((<Date>d1).getTime() + delta);
    }

    this.dayPointer = new Date(d1);
    this.setXminMax(d1, d2);
    this.chart.update();
  }

  private setMarker(hasRadius: boolean) {
    if (!hasRadius) {
      this.chart.config.data.datasets[0].pointRadius = 0;
      this.chart.config.data.datasets[1].pointRadius = 0;
    } else {
      this.chart.config.data.datasets[1].pointRadius = 3;
      if (this.type === ChartType.delta) {
        this.chart.config.data.datasets[0].pointRadius = 0;
      } else {
        this.chart.config.data.datasets[0].pointRadius = 3;
      }
    }
  }

  private openSnackBar(message: string, action: string) {
    // this.spinner.hide();
    this.snackBar.open(message, action, { duration: 2000 });
  }

  async fetchDataOn(aDate?: Date) {
    if (!aDate) {
      aDate = this.dataService.getMinHour();
    }
    this.type = ChartType.line;
    // this.spinner.show();
    const ok = await this.dataService.fetchWeeklyData(aDate);
    if (ok.status === true) {
      // this.spinner.hide();
    } else {
      this.openSnackBar('Refresh data failed', ok.description);
      this.router.navigate(['/']);
    }
  }

  private refresh(cfg?: any) {
    const opt = {
      // hover: {
      //   onHover: (active: Array<any>) => {
      //     if (active && !active.length) {
      //       return;
      //     }
      //     this.onChartHover({ active });
      //   }
      // },
      onClick: (event: any, active: Array<any>) => {
        event.stopPropagation();
        this.onChartClick({ event, active });
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

    this.chart = new Chart('canvas', config);
  }

  private onChartHover({ active }) {
    console.log(active);
  }

  private onChartClick({ event, active }) {
    try {
      const index1 = active[0]._index;
      const index2 = active[1]._index;
      // console.log(index1);
    } catch (error) {}
  }

  get zoom(): number {
    return this.zoomValue;
  }

  set zoom(value: number) {
    this.setZoom(value);
    this.chart.update();
  }

  private setZoom(value: number) {
    this.zoomValue = value;
    switch (value) {
      case 1:
        {
          const d1 = this.dayPointer;
          const d2 = new Date(d1);
          d2.setHours(d1.getHours() + 23);
          this.setXminMax(d1, d2);
        }
        break;
      case 2:
        {
          const d1 = this.dayPointer;
          const d2 = new Date(d1);
          d2.setHours(d1.getHours() + 23 + 24);
          this.setXminMax(d1, d2);
        }
        break;
      case 3:
        {
          const d1 = this.dayPointer;
          const d2 = new Date(d1);
          d2.setHours(d1.getHours() + 23 + 3 * 24);
          this.setXminMax(d1, d2);
        }
        break;
      case 4:
        {
          const d1 = this.dataService.getMinHour();
          const d2 = this.dataService.getMaxHour();
          this.setXminMax(d1, d2);
        }
        break;
    }
  }

  disableToggleMarker() {
    return this.type === ChartType.stderr;
  }

  pickDate(control, event) {
    const chosen = moment(event.value);
    this.fetchDataOn(chosen.toDate());
  }

  chartColor(type: string): string {
    if (this.type === type) {
      return 'accent';
    } else {
      return '';
    }
  }

  // private async stall(stallTime = 3000) {
  //   await new Promise(resolve => setTimeout(resolve, stallTime));
  // }
}
