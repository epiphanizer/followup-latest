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

  ngOnInit() {}

  ngOnDestroy() {}

  doLogin() {
    this.isLoading = true;
    let username = this.loginForm.controls.username.value;
    let password = this.loginForm.controls.password.value;
    this.authService.doLogin(username, password);
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
}
