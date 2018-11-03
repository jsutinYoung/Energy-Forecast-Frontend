import {HostListener} from '@angular/core';

export abstract class ComponentCanDeactivate {
  // abstract canDeactivate(): boolean;

  // @HostListener('window:beforeunload', ['$event'])
  // beforeunload($event: any) {
  //   if (!this.canDeactivate()) {
  //     $event.returnValue = true;
  //   }
  //   else {
  //     $event.returnValue = false;
  //   }
  // }

  // @HostListener('window:unload', ['$event'])
  // unload($event: any) {
  //   if (!this.canDeactivate()) {
  //     $event.returnValue = true;
  //   }
  //   else {
  //     $event.returnValue = false;
  //   }
  // }
}
