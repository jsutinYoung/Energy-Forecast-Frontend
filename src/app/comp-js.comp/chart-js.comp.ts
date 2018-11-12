import { Component, EventEmitter, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import _ from 'lodash';
import * as moment from 'moment';

import { WeeklyDataService } from '../service/weekly-data.service';

enum ChartType {
  line = 'line',
  area = 'area',
  bar = 'bar',
  stderr = 'stderr',
  delta = 'delta'
}

@Component({
  selector: 'app-chart-js',
  templateUrl: './chart-js.comp.html',
  styleUrls: ['./chart-js.comp.css']
})

// tslint:disable-next-line:component-class-suffix
export class ChartComp implements OnInit {
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
  // private isDiffMode = false;
  private hasRadius = true;
  private zoomValue = 1;
  private dayPointer: Date;
  private isUpdate = true;
  private title = 'NWP Energy Demand';
  type: ChartType;

  constructor(private dataService: WeeklyDataService) {}

  initConfig(): {} {
    const myoptions = {
      responsive: true,
      title: {
        display: true,
        text: this.title,
        fontColor: 'white',
        fontSize: 16
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

    let dataset0 = {
      label: 'Baseline',
      data: this.dataService.getBaseline(),
      pointRadius: 3,

      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    };
    dataset0 = _.merge(dataset0, this.fillColor0);

    let dataset1 = {
      label: 'Forecast',
      data: this.dataService.getForecast(),
      pointRadius: 3,

      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    };
    dataset1 = _.merge(dataset1, this.fillColor1);

    const mydatasets = [dataset0, dataset1];

    const config = {
      type: 'line',
      data: { labels: this.dataService.getHours(), datasets: mydatasets },
      options: myoptions
    };

    return config;
  }

  ngOnInit() {
    // Chart.defaults.global.animation.duration = 100;
    // Chart.defaults.global.animation.easing = 'linear';

    // this.chart = new Chart('canvas', config);
    this.type = ChartType.area;
    this.refresh(this.initConfig());

    // this.chart.config.data = {
    //   labels: this.dataService.getHours(),
    //   datasets: mydatasets
    // };
    // this.chart.config.type = 'line';
    // this.chart.config.data.options = myoptions;

    const d1 = this.dataService.getMinHour();
    const d2 = this.dataService.getFirstEndDayHour();
    this.dayPointer = new Date(d1);
    this.setXminMax(d1, d2);
  }

  displayLine() {
    if (this.type === ChartType.line) {
      return;
    }
    const ds = this.chart.config.data.datasets;
    if (ds.length === 3 || this.type === ChartType.delta) {
      this.refresh(this.initConfig());
      this.setMarker(this.hasRadius);
      this.isUpdate = false;
      this.zoom = this.zoomValue;
      this.isUpdate = true;
    }

    this.type = ChartType.line;
    this.chart.config.data.datasets[0].backgroundColor = '';
    this.chart.config.data.datasets[1].backgroundColor = '';

    const {
      scales: { xAxes }
    } = this.chart.options;
    xAxes[0].gridLines = '';

    this.chart.config.type = 'line';
    this.refresh();
  }

  displayArea() {
    if (this.type === ChartType.area) {
      return;
    }

    const ds = this.chart.config.data.datasets;
    if (ds.length === 3 || this.type === ChartType.delta) {
      this.refresh(this.initConfig());
      this.setMarker(this.hasRadius);
      this.isUpdate = false;
      this.zoom = this.zoomValue;
      this.isUpdate = true;
    }
    this.type = ChartType.area;
    this.chart.config.data.datasets[0].backgroundColor = this.fillColor0.backgroundColor;
    this.chart.config.data.datasets[1].backgroundColor = this.fillColor1.backgroundColor;

    const {
      scales: { xAxes }
    } = this.chart.options;
    xAxes[0].gridLines = { color: 'rgba(255,255,255, 0.3)' };

    this.chart.config.type = 'line';
    this.refresh();
  }

  displayBar() {
    if (this.type === ChartType.bar) {
      return;
    }
    const ds = this.chart.config.data.datasets;
    if (ds.length === 3 || this.type === ChartType.delta) {
      this.refresh(this.initConfig());
      this.setMarker(this.hasRadius);
      this.isUpdate = false;
      this.zoom = this.zoomValue;
      this.isUpdate = true;
    }

    this.type = ChartType.bar;
    this.chart.config.data.datasets[0].backgroundColor = this.fillColor0.backgroundColor;
    this.chart.config.data.datasets[1].backgroundColor = this.fillColor1.backgroundColor;

    const {
      scales: { xAxes }
    } = this.chart.options;
    xAxes[0].gridLines = { color: 'rgba(255,255,255, 0.3)' };

    this.chart.config.type = 'bar';

    this.chart.update();
  }

  displayStdError() {
    if (this.type === ChartType.stderr) {
      return;
    }

    this.chart.config.type = 'line';
    this.type = ChartType.stderr;
    const dsLow = this.chart.config.data.datasets[0];
    this.chart.config.options.title.text =
      this.title + ' -- Forecast & Std Errors';

    const optionalLegend = {
      display: true,
      position: 'bottom',
      labels: {
        fontColor: 'white',
        filter: function(legendItem, chartData) {
          if (legendItem.datasetIndex === 0) {
            legendItem.fillStyle = 'rgba(5, 206, 250,0.6)';
            return true;
          } else {
            return false;
          }
        }
      }
    };

    this.chart.config.options.legend = optionalLegend;

    dsLow.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dsLow.borderColor = '';
    dsLow.data = this.dataService.getLowError();
    dsLow.label = 'Lower';
    dsLow.pointRadius = '0';

    const dsHigh = this.chart.config.data.datasets[1];
    dsHigh.borderColor = '';
    dsHigh.backgroundColor = 'rgba(175, 176, 180, 0.5)';
    dsHigh.data = this.dataService.getHighError();
    dsHigh.label = 'Higher';
    dsHigh.pointRadius = '0';

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
    ds.pop();
    ds.pop();
    ds.push(dsLine);
    ds.push(dsLow);
    ds.push(dsHigh);

    this.refresh();
  }

  displayDelta() {
    if (this.type === ChartType.delta) {
      return;
    }

    this.type = ChartType.delta;
    const ds = this.chart.config.data.datasets;
    if (ds.length === 3) {
      this.refresh(this.initConfig());
      // this.setMarker(this.hasRadius);
      this.isUpdate = false;
      this.zoom = this.zoomValue;
      this.isUpdate = true;
    }

    this.chart.config.options.title.text = this.title + ' -- Delta';

    this.chart.config.type = 'line';
    const isOn = this.hasRadius ? 3 : 0;
    this.chart.config.data.datasets[0].data = this.dataService.getZeros();
    this.chart.config.data.datasets[0].label = 'Relative Baseline';
    this.chart.config.data.datasets[0].pointRadius = 0;
    this.chart.config.data.datasets[1].data = this.dataService.getDiff();
    this.chart.config.data.datasets[1].label = 'Forecast-Baseline';
    this.chart.config.data.datasets[1].pointRadius = isOn;
    this.chart.update();
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

  setXminMax(d1: Date, d2: Date, isUpdate = true) {
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
      this.chart.options.scales.xAxes[0].scaleLabel.labelString = `${m1.format(
        'MM-DD-YYYY h:mm a'
      )}  to  ${m2.format('MM-DD-YYYY h:mm a')}`;

      if (isUpdate) {
        this.chart.update();
      }
    }
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
  }

  toggleMarker() {
    this.hasRadius = !this.hasRadius;
    this.setMarker(this.hasRadius);
    this.refresh();
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

  randomize() {
    this.type = ChartType.line;
    this.dataService.randomize();
    // this.isDiffMode = !this.isDiffMode;
    // this.toggleUseDiffData();
    this.refresh(this.initConfig());
    this.setMarker(this.hasRadius);
    this.zoom = this.zoomValue;
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
      console.log(index1);
    } catch (error) {}
  }

  get zoom(): number {
    return this.zoomValue;
  }

  set zoom(value: number) {
    this.zoomValue = value;
    switch (value) {
      case 1:
        {
          const d1 = this.dayPointer;
          const d2 = new Date(d1);
          d2.setHours(d1.getHours() + 23);
          this.setXminMax(d1, d2, this.isUpdate);
        }
        break;
      case 2:
        {
          const d1 = this.dayPointer;
          const d2 = new Date(d1);
          d2.setHours(d1.getHours() + 23 + 24);
          this.setXminMax(d1, d2, this.isUpdate);
        }
        break;
      case 3:
        {
          const d1 = this.dayPointer;
          const d2 = new Date(d1);
          d2.setHours(d1.getHours() + 23 + 3 * 24);
          this.setXminMax(d1, d2, this.isUpdate);
        }
        break;
      case 4:
        {
          const d1 = this.dataService.getMinHour();
          const d2 = this.dataService.getMaxHour();
          this.setXminMax(d1, d2, this.isUpdate);
        }
        break;
    }
    // console.log(this.zoomValue);
  }

  disableToggleMarker() {
    return this.type === ChartType.stderr;
  }
}
