import {Component, OnInit} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading = false;

  constructor(private router: Router) {
    router.events.subscribe((event: RouterEvent) => {
      this.checkRouterEvent(event);
    });
  }

  ngOnInit() {
    firebase.initializeApp({
      apiKey: 'AIzaSyBG29GaX8Hx0HTW1fbFsS4LqCgbQLBmV40',
      authDomain: 'energy-forecast-8.firebaseapp.com'
    });
  }

  // for referrence how to use root router
  checkRouterEvent(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
      // console.log(this.loading);
    }

    if (event instanceof NavigationEnd || event instanceof NavigationCancel ||
        event instanceof NavigationError) {
      this.loading = false;
      // console.log(this.loading);
    }
  }
}
