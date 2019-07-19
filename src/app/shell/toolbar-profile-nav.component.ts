import { Component, OnInit } from '@angular/core';
import { User } from '@app/user/user';

@Component({
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  user: User = new User();
  constructor() {}

  ngOnInit() {}
}
