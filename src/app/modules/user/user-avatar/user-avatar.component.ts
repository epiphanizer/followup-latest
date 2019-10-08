import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserAvatarService } from './user-avatar.service';
import { User } from '../user';

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
    this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((baseImage: any) => {
      if (!baseImage) {
        this.avatarExists = false;
      } else {
        if (!baseImage.length) {
          this.avatarExists = false;
          return;
        }
        this.avatarExists = true;
        // @see https://medium.com/@koteswar.meesala/convert-array-buffer-to-base64-string-to-display-images-in-angular-7-4c443db242cd
        let TYPED_ARRAY = new Uint8Array(baseImage[0].userAvatarBlob.data);
        const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, '');
        let base64String = btoa(STRING_CHAR);
        this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
      }
    });
  }
}
