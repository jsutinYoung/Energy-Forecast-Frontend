import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'eft_alert'})

// export class AlertNamePipe implements PipeTransform {
//   transform(value: string) {
//     switch (value) {
//       case 'urgent':
//         return 'warn';
//       case 'warning':
//         return 'accent';
//       case 'annoucement':
//         return 'primary';
//       case 'info':
//         return '';
//       default:
//         return 'info';
//     }
//   }
// }

export class AlertNamePipe implements PipeTransform {
  transform(value: string, kind: string) {
    if (kind === 'icon') {
      switch (value) {
        case 'urgent':
          return 'offline_bolt';
        case 'warning':
          return 'warning';
        case 'announcement':
          return 'record_voice_over';
        case 'info':
          return 'info';
        default:
          return 'info';
      }
    } else {  // color
      switch (value) {
        case 'urgent':
          return 'warn';
        case 'warning':
          return 'accent';
        case 'announcement':
          return 'primary';
        case 'info':
          return '';
        default:
          return '';
      }
    }
  }
}

