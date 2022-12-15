import { Component, OnInit, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';
import { formatDate } from '@angular/common';
import { map, take } from 'rxjs/operators';
import { User } from '../../user';
import { UserService } from '../../user.service';

@Component({
  providers: [UserService],
  selector: 'app-user-listing-sidebar',
  templateUrl: './user-listing-sidebar.component.html',
  styleUrls: ['./user-listing-sidebar.component.scss'],
  animations: [
    trigger('expandSidebar', [
      state(
        'open',
        style({
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          opacity: 0
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.25s')])
    ]),
    trigger('turnArrow', [
      state(
        'open',
        style({
          transform: 'rotate(0deg)'
        })
      ),
      state(
        'closed',
        style({
          transform: 'rotate(-90deg)'
        })
      ),
      transition('open => closed', [animate('0.125s')]),
      transition('closed => open', [animate('0.125s')])
    ])
  ]
})
export class UserListingSidebarComponent implements OnInit {
  primaryTeam: number = 1;
  isOpen: boolean = true;
  users: {
    active: User[];
    inactive: User[];
  }[];
  todaysDateDay: string;
  constructor() {}

  ngOnInit() {
    this.todaysDateDay = formatDate(new Date(), 'dd', 'en');
  }
  // toggleTeamManagerSidebarMenu(team: Team) {
  //   team.teamManagerSidebarDropdownOpen = !team.teamManagerSidebarDropdownOpen;
  // }
  // toggleTeamCareRepSidebarMenu(team: Team) {
  //   team.teamCareRepSidebarDropdownOpen = !team.teamCareRepSidebarDropdownOpen;
  // }
  // toggleTeamSpanishSidebarMenu(team: Team) {
  //   team.teamSpanishSidebarDropdownOpen = !team.teamSpanishSidebarDropdownOpen;
  // }
}
