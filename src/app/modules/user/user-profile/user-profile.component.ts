import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { UserPutObject } from '@app/modules/user/user';
import { UserService } from '@app/modules/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { Observable } from 'rxjs';

@Component({
  providers: [UserService, UserAvatarService],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  avatarForm!: FormGroup;
  fileToUpload: File = null;
  error: string | undefined;
  user: User;
  userProfileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private userAvatarService: UserAvatarService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (!this.user.userFirstName) {
      var separatorIndex = this.user.displayName.indexOf(' ');
      this.user.userFirstName = this.user.displayName.substring(0, separatorIndex);
      this.user.userLastName = this.user.displayName.substring(separatorIndex, this.user.displayName.length);
    }

    this.createForm();
  }
  updateUserProfile() {
    let formSubmission = this.userProfileForm.getRawValue();
    let userPutPayload = this.userFormSubmissionFactory(formSubmission);
    this.userService.updateUserByUserId(this.user.id, userPutPayload).subscribe((data: any) => {
      console.log(data);
      debugger;
      alert('update successful!');
    });
  }

  /**
   * Package into a factory as we do on our forms
   */
  userFormSubmissionFactory(formSubmission: any): UserPutObject {
    var payload = {};
    let userInterests = formSubmission.userInterests;
    debugger;
    payload = {
      userFirstName: formSubmission.userFirstName,
      userMiddleName: formSubmission.userMiddleName,
      userLastName: formSubmission.userLastName,
      userPhoneCountryCode: formSubmission.userPhoneCountryCode,
      userPhoneAreaCode: formSubmission.userPhoneAreaCode,
      userPhoneNumber: formSubmission.userPhoneNumber,
      userDob: formSubmission.userDob,
      userFavoriteDessert: formSubmission.userFavoriteDessert,
      userInterests: userInterests,
      userAdditionalInfo: formSubmission.userAdditionalInfo
    };
    return <UserPutObject>payload;
  }
  private createForm() {
    this.userProfileForm = this.fb.group({
      userFirstName: this.fb.control(this.user.userFirstName, [Validators.required]),
      userMiddleName: this.fb.control(this.user.userMiddleName, [Validators.required]),
      userLastName: this.fb.control(this.user.userLastName, [Validators.required]),
      userEmail: [{ value: this.user.email, disabled: true }, [Validators.required, Validators.email]],
      userPhoneCountryCode: [this.user.userPhoneCountryCode, [Validators.required]],
      userPhoneAreaCode: [this.user.userPhoneAreaCode, [Validators.required]],
      userPhoneNumber: [this.user.userPhoneNumber, [Validators.required]],
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
  clickUploadInput() {
    let element: HTMLElement = document.querySelector('#fileUpload') as HTMLElement;
    element.click();
  }

  uploadUserAvatarPhoto(files: FileList) {
    this.fileToUpload = files.item(0);
    this.userAvatarService.uploadUserAvatarByUserId(this.user.id, this.fileToUpload).subscribe((data: any) => {
      this.userAvatarService.getUserAvatarByUserId(this.user.id);
    });
  }
}
