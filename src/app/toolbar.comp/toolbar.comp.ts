//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import { Component, Input, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import { RegisterComp } from '../register.comp/register.comp';
import { AboutDialog } from '../about.dialog/about.dialog';
import { UpdateUserDialog } from '../update-user.dialog/update-user.dialog';
import { AuthService, UserType } from '../service/auth.service';

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
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.drawer.toggle();
  }

  hasManagerRight(): boolean {
    if (this.authService.userType <= UserType.manager) {
      return true;
    } else {
      return false;
    }
  }

  async signOut() {
    this.authService.signOut();
    this.router.navigate(['/']);
  }

  registerUserDialog(): void {
    const dialogRef = this.dialog.open(RegisterComp, {
      maxWidth: 520,
      data: ''
    });

    // dialogRef.updatePosition({top: y + 'px', left: x + 'px'});
    dialogRef.afterClosed().subscribe(result => {
      // if (result) {
      //   const { type, user, pass, pass2, ref } = result;
      //   (<RegisterComp>ref).onDone({ type, user, pass, pass2 });
      // }
    });
  }

  get userID() {
    return this.authService.userID;
  }

  openAboutialog() {
    const dialogRef = this.dialog.open(AboutDialog, {
    });
  }

  openUpdateUserDialog() {
    const dialogRef = this.dialog.open(UpdateUserDialog, {
      height: '380px',
    });
  }
}
