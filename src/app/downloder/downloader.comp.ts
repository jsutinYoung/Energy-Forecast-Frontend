import {Component} from '@angular/core';
import {DownloaderService} from '../service/downloader.service';

@Component({
  selector: 'app-downloader',
  templateUrl: './downloader.comp.html',
  providers: [DownloaderService]
})

// tslint:disable-next-line:component-class-suffix
export class DownloaderComp {
  contents: string;
  constructor(private downloaderService: DownloaderService) {}

  clear() {
    this.contents = undefined;
  }

  download() {
    this.downloaderService.getTextFile('assets/textfile.txt')
        .subscribe(results => this.contents = results);
  }
}
