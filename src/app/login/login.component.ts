import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger, AuthenticationService, untilDestroyed } from '@app/core';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  error: string | undefined;
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private platform: Platform,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async signIn() {
    this.isLoading = true;
    let username = this.loginForm.controls.username.value;
    let password = this.loginForm.controls.password.value;
    let result = await this.authService.signIn(username, password);
    if (!result) {
      this.error = 'Login Error';
      this.isLoading = false;
      return this.error;
    }
    this.router.navigate(['/home']);
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
