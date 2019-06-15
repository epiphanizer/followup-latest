import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { environment } from '@env/environment';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeModule } from './home/home.module';
import { ShellModule } from './shell/shell.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
/**
 * Our authentication module
 */
import { MsAdalAngular6Module, AuthenticationGuard } from 'microsoft-adal-angular6';
import { CallQueueComponent } from './call-queue/call-queue.component';
import { ToolbarLogoComponent } from './shell/toolbar-logo.component';
import { UserCorkBoardComponent } from './user-cork-board/user-cork-board.component';
import { CallQueueCalendarWidgetComponent } from './call-queue/call-queue-calendar-widget.component';

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(),
    CoreModule,
    SharedModule,
    ShellModule,
    HomeModule,
    LoginModule,
    MsAdalAngular6Module.forRoot({
      tenant: '2eb67c1a-5ddf-4459-a83d-d481c0b33885',
      clientId: '602e6119-9342-44cc-aa5a-ec903d07487f',
      redirectUri: window.location.origin,
      endpoints: {
        'http://localhost': '602e6119-9342-44cc-aa5a-ec903d07487f'
      },
      navigateToLoginRequestUrl: false,
      cacheLocation: '<localStorage / sessionStorage>'
    }),
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [
    AppComponent,
    CallQueueComponent,
    ToolbarLogoComponent,
    UserCorkBoardComponent,
    CallQueueCalendarWidgetComponent
  ],
  providers: [AuthenticationGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
