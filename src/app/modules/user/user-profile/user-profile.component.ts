import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { SuperForm } from 'angular-super-validator';
import { UserPutObject } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { UserAvatarService } from '../user-avatar/user-avatar.service';

@Component({
  providers: [UserService, UserAvatarService],
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
    this.createForm();
  }
  // Passing E2E minus auth
  updateUserProfile() {
    if (!this.validateControls()) {
      return;
    }
    let formSubmission = this.userProfileForm.getRawValue();
    let userPutPayload = this.userFormSubmissionFactory(formSubmission);
    this.userService.updateUserByUserId(this.user.userId, userPutPayload).subscribe((data: any) => {
      window.location.href = '/profile';
    });
  }

  userFormSubmissionFactory(formSubmission: any): UserPutObject {
    var payload = {};
    let userInterests = JSON.stringify(formSubmission.userInterests);
    payload = {
      userFirstName: formSubmission.userFirstName,
      userMiddleName: formSubmission.userMiddleName,
      userLastName: formSubmission.userLastName,
      userCountryCode: formSubmission.userPhoneCountryCode,
      userAreaCode: formSubmission.userPhoneAreaCode,
      userPhoneNumber: formSubmission.userPhoneNumber,
      userDob: formSubmission.userDob,
      userFavoriteDessert: formSubmission.userFavoriteDessert,
      userInterests: userInterests,
      userAdditionalInfo: formSubmission.userAdditionalInfo
    };
    return <UserPutObject>payload;
  }

  private createForm() {
    if (!this.user.userInterests) {
      this.user.userInterests = {
        celebrity: false,
        helicopter: false,
        kidney: false,
        skydivedOrBungeed: false,
        appearedOnTv: false,
        janeAusten: false,
        escargo: false,
        deployed: false,
        instrument: false,
        seenTornado: false,
        hitchhiked: false,
        DND: false
      };
    } else {
      this.user.userInterests = JSON.parse(<string>this.user.userInterests);
    }
    // console.log(this.user.userInterests);
    // debugger;
    this.userProfileForm = this.fb.group({
      userFirstName: this.fb.control(this.user.userFirstName, [Validators.required]),
      userMiddleName: this.fb.control(this.user.userMiddleName),
      userLastName: this.fb.control(this.user.userLastName, [Validators.required]),
      userEmail: [
        {
          value: this.user.email,
          disabled: true
        }
      ],
      userPhoneCountryCode: [this.user.userCountryCode, [Validators.required]],
      userPhoneAreaCode: [this.user.userAreaCode, [Validators.required]],
      userPhoneNumber: [this.user.userPhoneNumber, [Validators.required]],
      userDob: [this.user.userDob, [Validators.required]],
      userFavoriteDessert: [this.user.userFavoriteDessert],
      userInterests: this.fb.group({
        celebrity: this.fb.control(this.user.userInterests.celebrity),
        helicopter: this.fb.control(this.user.userInterests.helicopter),
        kidney: this.fb.control(this.user.userInterests.kidney),
        skydivedOrBungeed: this.fb.control(this.user.userInterests.skydivedOrBungeed),
        appearedOnTv: this.fb.control(this.user.userInterests.appearedOnTv),
        janeAusten: this.fb.control(this.user.userInterests.janeAusten),
        escargo: this.fb.control(this.user.userInterests.escargo),
        deployed: this.fb.control(this.user.userInterests.deployed),
        instrument: this.fb.control(this.user.userInterests.instrument),
        seenTornado: this.fb.control(this.user.userInterests.seenTornado),
        hitchhiked: this.fb.control(this.user.userInterests.hitchhiked),
        DND: this.fb.control(this.user.userInterests.DND)
      }),
      userAdditionalInfo: this.fb.control(this.user.userAdditionalInfo)
    });
  }

  /**
   * A function to validate controls,
   * and if there are any validation errors,
   * bounce the user to the top.
   */
  validateControls(): boolean {
    console.log('Finding invalid controls...');
    const errors = SuperForm.getAllErrors(this.userProfileForm);
    console.log(JSON.stringify(errors));
    const errorsFlat = SuperForm.getAllErrorsFlat(this.userProfileForm);
    console.log(JSON.stringify(errorsFlat));
    // Double check this
    const firstError = <HTMLElement>document.getElementsByClassName('ng-invalid')[0];

    function scroll(el: HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (firstError) {
      scroll(firstError);
      return false;
    } else {
      return true;
    }
  }
}
