import { Component, Input, OnInit } from '@angular/core';
import { User, UserService } from '@app/modules/user/user.service';
import { AuthenticationService } from '@app/core';

@Component({
  providers: [UserService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  user: User;
  constructor(private authService: AuthenticationService, private userService: UserService) {}

  ngOnInit() {}
  signOut() {
    this.authService.signOut();
  }
}
