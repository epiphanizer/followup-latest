import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { UserAvatarService } from '@app/modules/user/user-avatar/user-avatar.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

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
    private authService: AuthenticationService,
    private userAvatarService: UserAvatarService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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
  }

  signOut() {
    this.authService.signOut();
  }
}
