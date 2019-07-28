import { Component, Input, OnInit } from '@angular/core';
import { User } from '@app/modules/user/user.service';

@Component({
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  @Input() user: User;
  constructor() {}
  ngOnInit() {}
}
