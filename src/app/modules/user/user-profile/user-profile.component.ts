import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  error: string | undefined;
  userProfileForm!: FormGroup;
  isLoading = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }
  updateUserProfile() {
    alert('updating user profile');
  }
  private createForm() {
    this.userProfileForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
}
