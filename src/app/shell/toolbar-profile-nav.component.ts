import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/core/user.service';

@Component({
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  constructor(userService: UserService) {}

  ngOnInit() {}
}
