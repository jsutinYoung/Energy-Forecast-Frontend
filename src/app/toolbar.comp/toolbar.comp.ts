import { Component, Input, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import { RegisterComp } from '../register.comp/register.comp';
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
}
