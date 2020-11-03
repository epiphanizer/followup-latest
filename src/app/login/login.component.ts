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
      console.log('this far');
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {}

  async signIn() {
    this.isLoading = true;
    let username = this.loginForm.controls.username.value;
    let password = this.loginForm.controls.password.value;
    if (!password.trim().length) {
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
