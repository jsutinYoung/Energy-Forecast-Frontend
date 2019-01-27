//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'eft_alert_shortener'})

export class AlertShortenerPipe implements PipeTransform {
  transform(value: string, kind: string) {
    if (kind === 'title') {
      if (value.length > 20) {
        return value.substring(0, 20) + '...';
      } else {
        return value.substring(0, 20);
      }
    } else {
      if (value.length > 28) {
        return value.substring(0, 28) + '...';
      } else {
        return value.substring(0, 28);
      }
    }
  }
}
