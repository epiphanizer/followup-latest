import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-user-profile-sidebar',
  templateUrl: './user-profile-sidebar.component.html',
  styleUrls: ['./user-profile-sidebar.component.scss']
})
export class UserProfileSidebarComponent implements OnInit {
  todaysDateDay: number;
  constructor() {}

  ngOnInit() {
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
}
