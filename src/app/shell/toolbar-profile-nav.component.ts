import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { UserAvatarService } from '@app/modules/user/user-avatar/user-avatar.service';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  providers: [AuthenticationService, UserAvatarService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  @Input() user: User;
  avatarExists: Boolean;
  public avatarUrl: SafeUrl;
  constructor(
    private authService: AuthenticationService,
    private userAvatarService: UserAvatarService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((data: any) => {
      console.log(data);
      if (data !== null) {
        var uploadUrl = data[0].userAvatarUploadPath;
        if (!uploadUrl) {
          this.avatarExists = false;
        } else {
          this.avatarUrl = uploadUrl;
          this.avatarExists = true;
        }
      }
    });
  }

  signOut() {
    this.authService.signOut();
  }
}
