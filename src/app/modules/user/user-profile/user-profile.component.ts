import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { User, UserService } from '@app/modules/user/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [UserService],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  error: string | undefined;
  user: User;
  userProfileForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.createForm();
  }
  updateUserProfile() {
    let formSubmission = this.userProfileForm.getRawValue();
    this.userService.updateUserByUserId(this.user.id, formSubmission);
  }
  private createForm() {
    this.userProfileForm = this.formBuilder.group({
      userFirstName: ['', [Validators.required]],
      userMiddleName: ['', [Validators.required]],
      userLastName: ['', [Validators.required]],
      userEmail: [{ value: this.user.email, disabled: true }, [Validators.required, Validators.email]],
      userPhoneCountryCode: ['', [Validators.required]],
      userPhoneAreaCode: ['', [Validators.required]],
      userPhoneNumber: ['', [Validators.required]],
      userPassword: [{ disabled: true }],
      userConfirmPassword: [{ disabled: true }],
      userDob: ['', [Validators.required]],
      userFavoriteDessert: [''],
      userAdditionalInfo: []
    });
  }
}
