import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { environment } from '@env/environment';
import { Logger, AuthenticationService, untilDestroyed } from '@app/core';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
    private authenticationService: AuthenticationService,
    private router: Router,
    private toastrService: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit() {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {}

  async signIn() {
    this.isLoading = true;
    const usernameControl = this.loginForm.controls.username.value;
    const passwordControl = this.loginForm.controls.password.value;

    const autofillUsername = String((document.getElementById('username') as HTMLInputElement)?.value ?? '').trim();
    const autofillPassword = String((document.getElementById('password') as HTMLInputElement)?.value ?? '').trim();

    const username = String(usernameControl ?? '').trim() || autofillUsername;
    if (!username.length) {
      this.toastrService.error('Enter username!');
      return false;
    }

    const password = String(passwordControl ?? '').trim() || autofillPassword;
    if (!password.length) {
      this.toastrService.error('Enter password!');
      return false;
    }
    let result = await this.authenticationService.signIn(username, password);
    if (!result) {
      this.toastrService.error('Incorrect username or password!');
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
