import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
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

import { CallQueueModule } from '@app/modules/call-queue/call-queue.module';
import { AlertsModule } from '@app/core/alerts/alerts.module';
import { PatientModule } from './modules/patient/patient.module';
import { OperationModule } from '@app/modules/operation/operation.module';
import { NotificationModule } from '@app/modules/notification/notification.module';
import { UserModule } from '@app/modules/user/user.module';
import { OperationService } from './modules/operation/operation.service';
import { LoginForgotComponent } from './login/login-forgot/login-forgot.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(),
    CoreModule,
    ReactiveFormsModule,
    MsalModule.forRoot({
      clientID: OAuthSettings.appId,
      authority: 'https://login.microsoftonline.com/common',
      redirectUri: 'http://localhost:4200/',
      validateAuthority: true,
      cacheLocation: 'localStorage',
      postLogoutRedirectUri: 'http://localhost:4200/login',
      navigateToLoginRequestUrl: false,
      popUp: false,
      consentScopes: OAuthSettings.scopes
    }),
    SharedModule,
    ShellModule,
    AlertsModule,
    HomeModule,
    LoginModule,
    PatientModule,
    CallQueueModule,
    OperationModule,
    NotificationModule,
    UserModule,
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent, LoginForgotComponent],
  providers: [MsalGuard, OperationService],
  bootstrap: [AppComponent]
})
export class AppModule {}
