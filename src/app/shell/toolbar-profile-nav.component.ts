import { Component, OnInit, Input } from '@angular/core';
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
  @Input() user: User;
  public avatarImg: string;
  constructor(private authService: AuthenticationService) {}

  ngOnInit() {}
  signOut() {
    this.authService.signOut();
  }
}
