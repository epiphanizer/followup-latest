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
    this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((baseImage: any) => {
      if (!baseImage) {
        this.avatarExists = false;
      } else {
        this.avatarExists = true;
      }
      this.avatarUrl = this.userAvatarService.prepareAvatarImage(baseImage);
    });
    // this.route.paramMap.subscribe(() => {
    //   debugger;
    //   if (this.route.snapshot.data.user.avatar == true) {
    //     this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((baseImage: any) => {
    //       if (!baseImage) {
    //         this.avatarExists = false;
    //       } else {
    //         this.avatarExists = true;
    //       }
    //       this.avatarUrl = this.userAvatarService.prepareAvatarImage(baseImage);
    //     })
    //   }
    // });
  }

  signOut() {
    this.authService.signOut();
  }
}
