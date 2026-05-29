import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { SuperForm } from 'angular-super-validator';
import { UserPutObject } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';
import { User, UserRolesMap } from '@app/modules/user/user';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { AuthenticationService } from '@app/core';
import { formatDate } from '@angular/common';

@Component({
  providers: [ToastrService, UserService, UserAvatarService],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: false
})
export class UserProfileComponent implements OnInit {
  error: string | undefined;
  user: User;
  currentUser: User;
  userProfileForm: FormGroup;
  isLoading = false;
  isAdminEditMode = false;

  numericRegEx = RegExp(/^[0-9]{1,7}$/);
  phoneRegEx = RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/);
  stringRegEx = RegExp(/^[a-z'?]*$/i);
  stringMinimumOneWordRegEx = RegExp(/^(?!\s*$).+/);

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.currentUser = this.authenticationService.currentUserSubject.getValue();
    const routeUserId = this.route.snapshot.paramMap.get('userId');
    this.isAdminEditMode = !!routeUserId;

    if (routeUserId) {
      if (this.getUserRoleValue(this.currentUser) !== 1) {
        this.router.navigate(['/user/profile']);
        return;
      }

      if (routeUserId === this.currentUser?.userId) {
        this.user = this.currentUser;
        this.createForm();
        return;
      }

      this.loadUserById(routeUserId);
      return;
    }

    this.user = this.route.snapshot.data.user || this.currentUser;
    this.createForm();
  }

  get pageTitle(): string {
    return this.isAdminEditMode ? 'Edit User' : 'User Profile';
  }

  get pageCopy(): string {
    return this.isAdminEditMode
      ? 'Admin edits update the selected user record and avatar without leaving the standard roster flow.'
      : 'Update your profile information and avatar.';
  }

  private buildDefaultUserInterests() {
    return {
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
  }

  private normalizeUserInterests(userInterests: any) {
    const defaultUserInterests = this.buildDefaultUserInterests();

    if (!userInterests) {
      return defaultUserInterests;
    }

    if (typeof userInterests === 'string') {
      try {
        const parsedUserInterests = JSON.parse(userInterests);
        return {
          ...defaultUserInterests,
          ...(parsedUserInterests || {})
        };
      } catch {
        return defaultUserInterests;
      }
    }

    if (typeof userInterests === 'object') {
      return {
        ...defaultUserInterests,
        ...userInterests
      };
    }

    return defaultUserInterests;
  }

  private normalizeUserDob(userDob: any): string {
    if (!userDob) {
      return '';
    }

    try {
      return formatDate(userDob, 'yyyy-MM-dd', 'en');
    } catch {
      return '';
    }
  }

  private createForm() {
    if (!this.user) {
      return;
    }

    this.user.userInterests = this.normalizeUserInterests(this.user.userInterests);

    this.userProfileForm = this.fb.group({
      userFirstName: this.fb.control(this.user.userFirstName, [
        Validators.required,
        Validators.pattern(this.stringMinimumOneWordRegEx)
      ]),
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
      userPhoneCountryCode: [this.user.userCountryCode || '1', [Validators.pattern(this.numericRegEx)]],
      userPhoneAreaCode: [this.user.userAreaCode || '', [Validators.pattern(this.numericRegEx)]],
      userPhoneNumber: [
        this.formatPhoneInputValue(String(this.user.userPhoneNumber || '')),
        [Validators.pattern(this.phoneRegEx)]
      ],
      userDob: this.fb.control(this.normalizeUserDob(this.user.userDob), [Validators.required]),
      userFavoriteDessert: this.fb.control(this.user.userFavoriteDessert),
      userSpeaksSpanish: this.fb.control(this.user.userSpeaksSpanish == true ? '1' : '0'),
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
    this.userProfileForm.updateValueAndValidity();
  }

  private loadUserById(userId: string) {
    this.isLoading = true;
    this.error = undefined;

    this.userService
      .getUserByUserId(userId)
      .pipe(take(1))
      .subscribe({
        next: (user: User) => {
          this.user = user;
          this.createForm();
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Unable to load this user record.';
          this.isLoading = false;
        }
      });
  }

  cancelUpdateProfile() {
    this.router.navigate(this.isAdminEditMode ? ['/users'] : ['/user/profile']);
  }

  updateUserProfile() {
    if (!this.validateControls()) {
      return;
    }
    let formSubmission = this.userProfileForm.getRawValue();
    let userPutPayload = this.userFormSubmissionFactory(formSubmission);
    this.userService.updateUserByUserId(this.user.userId, userPutPayload).subscribe((data: any) => {
      this.toastrService
        .success(this.isAdminEditMode ? 'Successfully updated user record!' : 'Successfully updated user profile!')
        .onShown.pipe(take(1))
        .subscribe(() => {
          this.applyFormSubmissionToUser(formSubmission);

          if (this.user?.userId === this.currentUser?.userId) {
            this.authenticationService.currentUserSubject.next(this.user);
            localStorage.setItem('followup-user', JSON.stringify(this.user));
          }

          this.createForm();
          this.router.navigate(this.isAdminEditMode ? ['/users'] : ['/user/profile']);
        });
    });
  }

  private applyFormSubmissionToUser(formSubmission: any) {
    this.user.userFirstName = formSubmission.userFirstName;
    this.user.userLastName = formSubmission.userLastName;
    this.user.userCountryCode = formSubmission.userPhoneCountryCode;
    this.user.userAreaCode = formSubmission.userPhoneAreaCode;
    this.user.userPhoneNumber =
      parseInt(this.formatPhoneInputValue(formSubmission.userPhoneNumber).replace(/\D/g, ''), 10) || undefined;
    this.user.userDob = formSubmission.userDob;
    this.user.userSpeaksSpanish = formSubmission.userSpeaksSpanish;
    this.user.userFavoriteDessert = formSubmission.userFavoriteDessert;
    this.user.userInterests = JSON.stringify(formSubmission.userInterests);
    this.user.userAdditionalInfo = formSubmission.userAdditionalInfo;
  }

  userFormSubmissionFactory(formSubmission: any): UserPutObject {
    var payload = {};
    let userInterests = JSON.stringify(formSubmission.userInterests);
    payload = {
      userFirstName: formSubmission.userFirstName,
      userLastName: formSubmission.userLastName,
      userCountryCode: formSubmission.userPhoneCountryCode || '1',
      userAreaCode: formSubmission.userPhoneAreaCode || '',
      userPhoneNumber: this.formatPhoneInputValue(formSubmission.userPhoneNumber),
      userSpeaksSpanish: parseInt(formSubmission.userSpeaksSpanish),
      userDob: formSubmission.userDob || '',
      userFavoriteDessert: formSubmission.userFavoriteDessert || '',
      userInterests: userInterests,
      userAdditionalInfo: formSubmission.userAdditionalInfo
    };
    return <UserPutObject>payload;
  }

  private formatPhoneInputValue(phoneValue: string): string {
    if (!phoneValue) {
      return '';
    }

    const digits = phoneValue.toString().replace(/[^0-9]/g, '');

    if (digits.length === 7) {
      return digits.substr(0, 3) + '-' + digits.substr(3);
    }

    if (digits.length === 10) {
      return digits.substr(0, 3) + '-' + digits.substr(3, 3) + '-' + digits.substr(6);
    }

    return phoneValue.toString();
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
      // window.scrollTo(0, 0);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (firstError) {
      // scroll(firstError);
      alert('Please fill all required fields');
      return false;
    } else {
      return true;
    }
  }

  private getUserRoleValue(user: User): number {
    if (!user) {
      return 0;
    }

    if (typeof user.userLevel === 'number') {
      return user.userLevel;
    }

    return (UserRolesMap as any)[String(user.userLevel)] || 0;
  }
}
