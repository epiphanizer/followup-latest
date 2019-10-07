import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserAvatarService } from './user-avatar/user-avatar.service';
import { User } from './user';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {
  avatarUrl: SafeUrl;
  @Input() user: User;
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(private userAvatarService: UserAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.userAvatarService.getUserAvatarByUserId(this.user.id).subscribe((baseImage: any) => {
      if (!baseImage[0]) {
        this.avatarExists = false;
      } else {
        this.avatarExists = true;
        // @see https://medium.com/@koteswar.meesala/convert-array-buffer-to-base64-string-to-display-images-in-angular-7-4c443db242cd
        let TYPED_ARRAY = new Uint8Array(baseImage[0].patientAvatarBlob.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
      }
    });
  }
}
