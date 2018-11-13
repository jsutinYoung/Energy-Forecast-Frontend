import 'hammerjs';

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatDatepickerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSliderModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
} from '@angular/material';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher
} from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OAuthModule } from 'angular-oauth2-oidc';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

import { AppRoutingModule } from './app-route.module';
import { AppComponent } from './app.component';
import { ChartComp } from './comp-js.comp/chart-js.comp';
import { DashComp } from './dash.comp/dash.comp';
import { DownloaderComp } from './downloder/downloader.comp';
import { DrawerComp } from './drawer.comp/drawer.comp';
import { DummyComp } from './dummy.comp/dummy.comp';
import { ErrorPageComp } from './error-page.comp/error-page.comp';
import { MyHttpInterceptorProviders } from './interceptor/interceptor-list';
import { LoginComp } from './login.comp/login.comp';
import { AlertNamePipe } from './pipe/alert-name.pipe';
import { AlertService } from './service/alert.service';
import { Toolbar } from './toolbar.comp/toolbar.comp';
import { UploaderComp } from './uploader.comp/uploader.comp';

@NgModule({
  declarations: [
    AppComponent,
    Toolbar,
    DrawerComp,
    LoginComp,
    ChartComp,
    AlertNamePipe,
    ErrorPageComp,
    DummyComp,
    LoginComp,
    DashComp,
    UploaderComp,
    DownloaderComp
  ],
  imports: [
    BrowserModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    FlexLayoutModule,
    AppRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    Ng4LoadingSpinnerModule.forRoot(),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://www.angular.at/api'],
        sendAccessToken: true
      }
    })
  ],
  // or @Injectable({ providedIn: 'root' })
  providers: [
    AlertService,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    MyHttpInterceptorProviders
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
