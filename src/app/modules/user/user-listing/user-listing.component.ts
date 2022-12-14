import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user';

@Component({
  providers: [UserService],
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss']
})
export class UserListingComponent implements OnInit {
  public selected:
    | {
        filterDate: string;
        user: User;
        users$: Observable<User>;
      }
    | any = {};

  user: User;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    // this.users = this.user.teams;
    // this.selected.team = this.teams[0];
  }
}
