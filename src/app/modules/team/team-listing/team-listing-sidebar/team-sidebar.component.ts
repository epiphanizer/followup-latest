import { Component, OnInit, Input } from '@angular/core';
import { formatDate } from '@angular/common';
import { Team } from '../../team';

@Component({
  selector: 'app-team-sidebar',
  templateUrl: './team-sidebar.component.html',
  styleUrls: ['./team-sidebar.component.scss']
})
export class TeamSidebar implements OnInit {
  isOpen: boolean = true;
  todaysDateDay: number;
  @Input() team: Team;
  constructor() {}

  ngOnInit() {
    this.todaysDateDay = parseInt(formatDate(new Date(), 'dd', 'en'));
  }
  toggleUserSidebarMenu() {
    this.isOpen = !this.isOpen;
  }
}
