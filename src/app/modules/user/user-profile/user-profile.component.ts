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

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private userService: UserService) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    debugger;
    this.createForm();
  }
  updateUserProfile() {
    let formSubmission = this.userProfileForm.getRawValue();
    debugger;
    this.userService.updateUserByUserId(this.user.id, formSubmission);
  }

  /**
   * Package into a factory as we do on our forms
   */

  private createForm() {
    this.userProfileForm = this.fb.group({
      userFirstName: this.fb.control(this.user.userFirstName, [Validators.required]),
      userMiddleName: this.fb.control(this.user.userMiddleName, [Validators.required]),
      userLastName: this.fb.control(this.user.userLastName, [Validators.required]),
      userEmail: [{ value: this.user.email, disabled: true }, [Validators.required, Validators.email]],
      userPhoneCountryCode: [this.user.userPhoneCountryCode, [Validators.required]],
      userPhoneAreaCode: [this.user.userPhoneAreaCode, [Validators.required]],
      userPhoneNumber: [this.user.userPhoneNumber, [Validators.required]],
      userPassword: [{ disabled: true }],
      userConfirmPassword: [{ disabled: true }],
      userDob: [this.user.userDob, [Validators.required]],
      userFavoriteDessert: [''],
      userInterests: this.fb.group({
        celebrity: this.fb.control(false),
        helicopter: this.fb.control(false),
        kidney: this.fb.control(false),
        skydivedOrBungeed: this.fb.control(false),
        appearedOnTv: this.fb.control(false),
        janeAusten: this.fb.control(false),
        escargo: this.fb.control(false),
        deployed: this.fb.control(false),
        instrument: this.fb.control(false),
        seenTornado: this.fb.control(false),
        hitchhiked: this.fb.control(false),
        DND: this.fb.control(false)
      }),
      userAdditionalInfo: this.fb.control({})
    });
  }
  uploadUserAvatarPhoto() {
    debugger;
  }
}
