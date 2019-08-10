import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '@app/core';

@Component({
  selector: 'app-login-forgot',
  templateUrl: './login-forgot.component.html',
  styleUrls: ['./login-forgot.component.scss']
})
export class LoginForgotComponent implements OnInit {
  passwordResetForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, private authService: AuthenticationService) {
    this.createForm();
  }
  createForm() {
    this.passwordResetForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]]
    });
  }
  ngOnInit() {}

  resetPassword() {
    console.log('Submitting password reset form');
    // this.authService.resetPasswordRequestForUser();
  }
}
