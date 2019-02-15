//
// CS 421 Keystore project: Energy Forecast Tool
// Author: Justin Young
// Team: Justin Young, John Karasev, Sean Bates
// 2019
//

import 'hammerjs';

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageServiceModule } from 'angular-webstorage-service';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSliderModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSelectModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AlertComp } from './alert.comp/alert.comp';
import { AlertDialog } from './alert.dialog/alert.dialog';
import { AboutDialog } from './about.dialog/about.dialog';
import { AppRoutingModule } from './app-route.module';
import { AppComponent } from './app.component';
import { ChartComp } from './chart-js.comp/chart-js.comp';
import { HistComp } from './hist-chart.comp/hist-chart.comp';
import { DashComp } from './dash.comp/dash.comp';
import { DummyComp } from './dummy.comp/dummy.comp';
import { ErrorPageComp } from './error-page.comp/error-page.comp';
import { MyHttpInterceptorProviders } from './interceptor/interceptor-list';
import { LoginComp } from './login.comp/login.comp';
import { RegisterComp } from './register.comp/register.comp';
import { AlertShortenerPipe } from './pipe/alert-shortener.pipe';
import { AlertService } from './service/alert.service';
import { Toolbar } from './toolbar.comp/toolbar.comp';
import { DailyFabComp } from './daily-fab.comp/daily-fab.comp';
import { UpdateUserDialog } from './update-user.dialog/update-user.dialog';
import { DeleteUserDialog } from './delete-user.dialog/delete-user.dialog';

@NgModule({
  declarations: [
    AppComponent,
    Toolbar,
    AlertComp,
    LoginComp,
    ChartComp,
    HistComp,
    AlertShortenerPipe,
    ErrorPageComp,
    DummyComp,
    LoginComp,
    RegisterComp,
    DashComp,
    AlertDialog,
    AboutDialog,
    UpdateUserDialog,
    DeleteUserDialog,
    DailyFabComp
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
    MatDialogModule,
    MatSelectModule,
    StorageServiceModule,
    NgxSpinnerModule
  ],
  // or @Injectable({ providedIn: 'root' })
  providers: [
    AlertService,
    // { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    MyHttpInterceptorProviders
  ],
  entryComponents: [AlertDialog, AboutDialog, UpdateUserDialog, DeleteUserDialog, RegisterComp],
  bootstrap: [AppComponent]
})
export class AppModule {}
