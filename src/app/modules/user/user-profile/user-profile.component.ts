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

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }
  updateUserProfile() {
    alert('updating user profile');
  }
  private createForm() {
    this.userProfileForm = this.formBuilder.group({
      userFirstName: ['', [Validators.required]],
      userMiddleName: ['', [Validators.required]],
      userLastName: ['', [Validators.required]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhone: ['', [Validators.required]],
      userPassword: ['', [Validators.required]],
      userConfirmPassword: ['', [Validators.required]],
      userDob: ['', [Validators.required]],
      userFavoriteDessert: [''],
      userAdditionalInfo: []
    });
  }
}
