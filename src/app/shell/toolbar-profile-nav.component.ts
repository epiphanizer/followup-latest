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
        var reader = new FileReader();
        reader.readAsDataURL(data);
        var self = this;
        reader.onloadend = function() {
          var base64data = reader.result;
          console.log(base64data);
          self.avatarUrl = base64data;
          self.avatarExists = true;
        };
      }
    });
  }

  signOut() {
    this.authService.signOut();
  }
}
