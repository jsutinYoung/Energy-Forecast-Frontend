import {Component, Input, OnInit} from '@angular/core';
import {MatDrawer} from '@angular/material';
import {Router} from '@angular/router';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.comp.html',
  styleUrls: ['./toolbar.comp.css']
})
// tslint:disable-next-line:component-class-suffix
export class Toolbar implements OnInit {
  // example of async property
  asyncProp = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok');
    }, 5000);
  });

  isDrawerOpen = false;

  @Input() drawer: MatDrawer;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.drawer.toggle();
  }

  async signOut() {
    this.authService.signOut();
    this.router.navigate(['/']);
  }
}
