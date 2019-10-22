import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../../notification.service';
import { Notification } from '../../notification';

@Component({
  selector: 'app-notification-patient-listing',
  templateUrl: './notification-patient-listing.component.html',
  styleUrls: ['./notification-patient-listing.component.scss']
})
export class NotificationPatientListingComponent implements OnInit {
  @Input() operation: Operation;
  public notifications: Notification[];
  public notifications$: Observable<Notification[]>;
  public filterBy: string = 'notification-date';
  public selectedSortFlag: string = 'desc';

  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notifications$ = this.notificationService.getNotificationsByOperationId(this.operation.operationId).pipe(
      map((notifications: Notification[]) => {
        this.notifications = notifications;
        return notifications;
      })
    );
  }

  public sortNotificationsByNotificationDate = function(sortFlag: string) {
    this.filterBy = 'notification-date';
    if (sortFlag == 'asc') {
      this.notifications.sort((a: Notification, b: Notification) => {
        return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
      });
    } else {
      this.notifications.sort((a: Notification, b: Notification) => {
        return <any>new Date(b.notificationCreatedDate) - <any>new Date(a.notificationCreatedDate);
      });
    }
  };

  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }
  }
  sortNotificationsByNotificationType = function(sortFlag: string) {
    this.filterBy = 'notification-type';
    // if (this.selectedSortFlag == 'asc') {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
    //   });
    // } else {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) + <any>new Date(b.notificationCreatedDate);
    //   });
    // }
  };
  sortNotificationsByPatient = function(sortFlag: string) {
    this.filterBy = 'patient';
    // if (this.selectedSortFlag == 'asc') {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
    //   });
    // } else {
    //   this.notifications.sort((a: Notification, b: Notification) => {
    //     return <any>new Date(a.notificationCreatedDate) + <any>new Date(b.notificationCreatedDate);
    //   });
    // }
  };
  sortNotificationsByStatus = function(sortFlag: string) {
    this.filterBy = 'status';
    alert('Toggling notifications by status');
  };
}
