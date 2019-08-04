import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user.service';
import { AuthenticationService } from '@app/core';

@Component({
  providers: [AuthenticationService],
  selector: 'app-toolbar-profile-nav',
  templateUrl: './toolbar-profile-nav.component.html',
  styleUrls: ['./toolbar-profile-nav.component.scss']
})
export class ToolbarProfileNavComponent implements OnInit {
  public user: User;
  constructor(private route: ActivatedRoute, private authService: AuthenticationService) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }
  signOut() {
    this.authService.signOut();
  }
}
