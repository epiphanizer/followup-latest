import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { environment } from '@env/environment';

import { CoreModule, ErrorHandlerInterceptor } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeModule } from './home/home.module';
import { ShellModule } from './shell/shell.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { CallQueueModule } from '@app/modules/call-queue/call-queue.module';
import { PatientModule } from './modules/patient/patient.module';
import { OperationModule } from '@app/modules/operation/operation.module';
import { NotificationModule } from '@app/modules/notification/notification.module';
import { UserModule } from '@app/modules/user/user.module';

import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule } from 'ngx-mask';
import { AppRoutingModule } from './app-routing.module';
import { JwtHelperService, JwtModule, JwtInterceptor } from '@auth0/angular-jwt';
import { AuthGuardService } from './core/authentication/auth-guard.service';
import { LoaderService } from './shared/loader/loader.service';
import { LoaderInterceptor } from './shared/interceptors/loader-interceptor';
import { ApiKeyInterceptor } from './shared/interceptors/api-key.interceptor';
import { TeamModule } from './modules/team/team.module';
import { nl2brPipe } from './shared/pipes/nl2br.pipe';

export function tokenGetter() {
  return localStorage.getItem('followup-token');
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('./ngsw-worker.js', {
      enabled: environment.production
    }),
    ToastrModule.forRoot(),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot({
      mode: 'md',
      animated: false
    }),
    CoreModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:3000', 'followupcare-api.azurewebsites.net']
      }
    }),
    NgxMaskModule.forRoot(),
    SharedModule,
    ShellModule,
    ReactiveFormsModule,
    HomeModule,
    LoginModule,
    UserModule,
    PatientModule,
    CallQueueModule,
    OperationModule,
    NotificationModule,
    TeamModule,
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent],
  providers: [
    JwtHelperService,
    AuthGuardService,
    LoaderService,
    // jwt interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiKeyInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
