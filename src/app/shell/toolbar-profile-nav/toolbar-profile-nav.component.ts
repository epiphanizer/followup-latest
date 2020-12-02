import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { UserAvatarService } from '@app/modules/user/user-avatar/user-avatar.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  providers: [AuthenticationService, UserAvatarService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  @Input() user: User;
  avatarExists: Boolean;
  public avatarUrl: SafeStyle;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private userAvatarService: UserAvatarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (!this.user.avatarData) {
      this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((data: any) => {
        if (data !== null) {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          var self = this;
          reader.onloadend = function() {
            var base64data = reader.result;
            self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
            self.avatarExists = true;
          };
        }
      });
    } else {
      var reader = new FileReader();
      reader.readAsDataURL(this.user.avatarData);
      var self = this;
      reader.onloadend = function() {
        var base64data = reader.result;
        self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
        self.avatarExists = true;
      };
    }
  }

  signOut() {
    this.authService.signOut();
  }
  addPhotos() {
    alert('adding photos');
  }
  editProfile() {
    this.router.navigate['/profile'];
  }
  postNote() {
    alert('add post it note');
  }
}
