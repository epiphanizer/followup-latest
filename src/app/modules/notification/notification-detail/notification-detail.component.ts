import { Component, OnInit } from '@angular/core';
import { Notification } from '../notification';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss']
})
export class NotificationDetailComponent implements OnInit {
  notification: Notification;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.notification = this.route.snapshot.data.notification;
  }
}
