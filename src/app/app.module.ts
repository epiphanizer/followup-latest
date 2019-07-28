import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { UserCorkBoardModule } from './shell/user-cork-board.module';

/**
 * Call Queue Module
 */
import { CallQueueModule } from '@app/modules/call-queue/call-queue.module';

import { AlertsModule } from '@app/core/alerts/alerts.module';

/**
 * Should we be importing this as module?
 */
import { PatientModule } from './modules/patient/patient.module';
import { PatientAvatarModule } from './modules/patient/patient-avatar/patient-avatar.module';
import { PatientDetailModule } from './modules/patient/patient-detail/patient-detail.module';

/**
 * Call Queue Module
 */
import { OperationModule } from '@app/modules/operation/operation.module';

// import { UserModule } from '@app/modules/user/user.module';

import { UserService } from './core/user.service';
import { ApiService } from './core/api.service';
import { UserAddComponent } from './modules/user/user-add/user-add.component';
import { UserEditComponent } from './modules/user/user-edit/user-edit.component';
import { UserDetailComponent } from './modules/user/user-detail/user-detail.component';
import { OperationAdminComponent } from './modules/operations/operation-admin/operation-admin.component';

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
    ToolbarLogoModule,
    UserCorkBoardModule,
    PatientAvatarModule,
    PatientDetailModule,
    HomeModule,
    LoginModule,
    PatientModule,
    CallQueueModule,
    OperationModule,
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [
    AppComponent,
    NotificationComponent,
    NotificationDetailListingComponent,
    NotificationDetailComponent,
    OperationEditFormComponent,
    UserAddNewFormComponent,
    UserEditFormComponent,
    UserDetailComponent,
    OperationAdminComponent
  ],
  providers: [MsalGuard, ApiService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule {}
