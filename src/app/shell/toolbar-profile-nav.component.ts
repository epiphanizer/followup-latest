import { Component, OnInit } from '@angular/core';
import { User, UserService } from '@app/core/user.service';

@Component({
  providers: [UserService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  user: User;
  userService: UserService;
  constructor(userService: UserService) {}
  ngOnInit() {
    this.user = this.userService.getCurrentUser();
  }
}
