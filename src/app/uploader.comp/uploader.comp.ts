import { Component } from '@angular/core';
import { UploaderService } from '../service/uploader.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.comp.html',
  providers: [ UploaderService ]
})
// tslint:disable-next-line:component-class-suffix
export class UploaderComp {
  message: string;

  constructor(private uploaderService: UploaderService) {}

  onPicked(input: HTMLInputElement) {
    const file = input.files[0];
    if (file) {
      this.uploaderService.upload(file).subscribe(
        msg => {
          input.value = null;
          this.message = msg;
        }
      );
    }
  }
}
