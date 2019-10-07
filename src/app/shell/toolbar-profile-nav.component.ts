import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  providers: [AuthenticationService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  public user: User;
  public avatarImg: string;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }
  signOut() {
    this.authService.signOut();
  }
}
