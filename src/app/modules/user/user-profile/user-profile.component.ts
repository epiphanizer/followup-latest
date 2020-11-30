import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { SuperForm } from 'angular-super-validator';
import { UserPutObject } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { AuthenticationService } from '@app/core';
import { of } from 'rxjs';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  providers: [ToastrService, UserService, UserAvatarService],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  error: string | undefined;
  user: User;
  userProfileForm: FormGroup;

  numericRegEx = RegExp(/^[0-9]{1,7}$/);
  phoneRegEx = RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/);
  stringRegEx = RegExp(/^[a-z'?]*$/i);
  stringMinimumOneWordRegEx = RegExp(/^(?!\s*$).+/);

  constructor(
    private authenticationService: AuthenticationService,
    private operationService: OperationService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.authenticationService.currentUserSubject.getValue();
    console.log(this.user);
    this.createForm();
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
      console.log(this.user.userInterests);
      if (typeof this.user.userInterests == 'object') {
      } else {
        this.user.userInterests = JSON.parse(<string>this.user.userInterests);
      }
    }
    this.userProfileForm = this.fb.group({
      userFirstName: this.fb.control(this.user.userFirstName, [
        Validators.required,
        Validators.pattern(this.stringMinimumOneWordRegEx)
      ]),
      userMiddleName: this.fb.control(this.user.userMiddleName),
      userLastName: this.fb.control(this.user.userLastName, [
        Validators.required,
        Validators.pattern(this.stringMinimumOneWordRegEx)
      ]),
      userEmail: [
        {
          value: this.user.userEmail,
          disabled: true
        }
      ],
      userPhoneCountryCode: [this.user.userCountryCode, [Validators.pattern(this.numericRegEx)]],
      userPhoneAreaCode: [this.user.userAreaCode, [Validators.pattern(this.numericRegEx)]],
      userPhoneNumber: [this.user.userPhoneNumber, [Validators.pattern(this.phoneRegEx)]],
      userDob: [this.user.userDob],
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

  // Passing E2E minus auth
  updateUserProfile() {
    if (!this.validateControls()) {
      return;
    }
    let formSubmission = this.userProfileForm.getRawValue();
    let userPutPayload = this.userFormSubmissionFactory(formSubmission);
    this.userService.updateUserByUserId(this.user.userId, userPutPayload).subscribe((data: any) => {
      this.toastrService
        .success('Successfully updated user profile!')
        .onShown.pipe(take(1))
        .subscribe(() => {
          /**
           * Setters
           */
          this.user.userFirstName = formSubmission.userFirstName;
          this.user.userMiddleName = formSubmission.userMiddleName;
          this.user.userLastName = formSubmission.userLastName;
          this.user.userCountryCode = formSubmission.userPhoneCountryCode;
          this.user.userAreaCode = formSubmission.userPhoneAreaCode;
          this.user.userPhoneNumber = formSubmission.userPhoneNumber;
          this.user.userFavoriteDessert = formSubmission.userFavoriteDessert;
          this.user.userInterests = JSON.stringify(formSubmission.userInterests);
          this.authenticationService.currentUserSubject.next(this.user);
          this.authenticationService.currentUserSubject.complete();
          this.user.operations$ = null;
          var userToSet = JSON.stringify(this.user);
          localStorage.removeItem('followup-user');
          localStorage.setItem('followup-user', userToSet);
          this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
          window.location.href = '/user/profile';
        });
    });
  }

  userFormSubmissionFactory(formSubmission: any): UserPutObject {
    var payload = {};
    let userInterests = JSON.stringify(formSubmission.userInterests);
    payload = {
      userFirstName: formSubmission.userFirstName,
      userMiddleName: formSubmission.userMiddleName || '',
      userLastName: formSubmission.userLastName,
      userCountryCode: formSubmission.userPhoneCountryCode || '',
      userAreaCode: formSubmission.userPhoneAreaCode || '',
      userPhoneNumber: formSubmission.userPhoneNumber || '',
      userDob: formSubmission.userDob || '',
      userFavoriteDessert: formSubmission.userFavoriteDessert || '',
      userInterests: userInterests,
      userAdditionalInfo: formSubmission.userAdditionalInfo
    };
    return <UserPutObject>payload;
  }
  /**
   * A function to validate form controls
   * and if there are any validation errors,
   * bounce the user to that error while spitting
   * out what the error is in the console.
   */
  validateControls(): boolean {
    console.log('Finding invalid controls...');
    const errors = SuperForm.getAllErrors(this.userProfileForm);
    console.log(JSON.stringify(errors));
    const errorsFlat = SuperForm.getAllErrorsFlat(this.userProfileForm);
    console.log(JSON.stringify(errorsFlat));
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
