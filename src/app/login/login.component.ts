import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger, AuthenticationService, untilDestroyed } from '@app/core';

import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';

const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  error: string | undefined;
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private broadcastService: BroadcastService,
    private platform: Platform,
    private authService: AuthenticationService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.broadcastService.subscribe('msal:loginFailure', payload => {
      alert('login failure');
    });
    this.broadcastService.subscribe('msal:loginSuccess', payload => {
      alert('login success');
    });
    this.broadcastService.subscribe('msal:acquireTokenSuccess', payload => {
      alert('token success');
    });

    this.broadcastService.subscribe('msal:acquireTokenFailure', payload => {
      alert('token failure');
    });
  }

  ngOnDestroy() {
    this.broadcastService.getMSALSubject().next(1);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  signIn() {
    var username = this.loginForm.get('username').value();
    var password = this.loginForm.get('username').value();
    debugger;
    this.authService.signIn(username, password);
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
}
