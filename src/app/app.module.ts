import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { environment } from '@env/environment';

import { MsalModule, MsalGuard } from '@azure/msal-angular';
import { OAuthSettings } from '../oauth';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeModule } from './home/home.module';
import { ShellModule } from './shell/shell.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

/**
 * Layout / Shell Views
 */
import { ToolbarLogoModule } from './shell/toolbar-logo.module';

// import { UserCorkBoardModule } from './shell/user-cork-board.module';

/**
 * Call Queue Module
 */
import { CallQueueModule } from '@app/modules/call-queue/call-queue.module';

import { AlertsModule } from '@app/core/alerts/alerts.module';

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(),
    CoreModule,

    MsalModule.forRoot({
      clientID: OAuthSettings.appId
    }),
    SharedModule,
    ShellModule,
    AlertsModule,
    ToolbarLogoModule,
    HomeModule,
    LoginModule,
    // MsAdalAngular6Module.forRoot({
    //   tenant: '2eb67c1a-5ddf-4459-a83d-d481c0b33885',
    //   clientId: '602e6119-9342-44cc-aa5a-ec903d07487f',
    //   redirectUri: window.location.origin,
    //   endpoints: {
    //     'http://localhost': '602e6119-9342-44cc-aa5a-ec903d07487f'
    //   },
    //   navigateToLoginRequestUrl: false,
    //   cacheLocation: '<localStorage / sessionStorage>'
    // }),
    CallQueueModule,
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent, AlertsComponent],
  providers: [MsalGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
