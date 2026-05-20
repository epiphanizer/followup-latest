import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { map, take } from 'rxjs/operators';
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
  public notificationsFiltered: Notification[];
  public pageOfItems: Notification[];
  // Default to sorting by notification date descending.
  public selectedSortFlag: string = 'desc';
  public colDefs = ['Date', 'Patient', 'Type', 'Care Rep', 'Status'];
  public selectedSortOption = this.colDefs[0];

  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notifications = [];
    this.operation = this.operation;
    this.notificationService
      .getNotificationsByOperationId(this.operation.operationId)
      .pipe(
        take(1),
        map((notifications: [Notification]) => {
          this.notifications = notifications;
          this.notificationsFiltered = notifications;
          this.runSortSwitch();
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.notifications = [];
      this.operation = changes.operation.currentValue;
      this.notificationService
        .getNotificationsByOperationId(this.operation.operationId)
        .pipe(
          take(1),
          map((notifications: [Notification]) => {
            if (notifications) {
              this.notifications = notifications;
              this.notificationsFiltered = notifications;
              this.runSortSwitch();
            } else {
              this.notificationsFiltered = this.notifications = [];
            }
          })
        )
        .subscribe();
    }
  }
  toggleAscDesc($event: string) {
    this.selectedSortFlag = $event;
    this.runSortSwitch();
  }
  sortOptionSelected($event: string) {
    this.selectedSortOption = $event;
    this.runSortSwitch();
  }
  public runSortSwitch() {
    if (!this.notifications) {
      return false;
    }
    switch (this.selectedSortOption) {
      case 'Date':
        this.sortNotificationsByNotificationDate();
        break;
      case 'Patient':
        this.sortNotificationsByPatient();
        break;
      case 'Type':
        this.sortNotificationsByNotificationType();
        break;
      case 'Care Rep':
        this.sortNotificationsByCareRep();
        break;
      case 'Status':
        this.sortNotificationsByStatus();
        break;
    }
  }
  public sortNotificationsByNotificationDate = function() {
    if (this.selectedSortFlag == 'asc') {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return <any>new Date(a.notificationCreatedTime) - <any>new Date(b.notificationCreatedTime);
        })
        .slice();
    } else {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return <any>new Date(b.notificationCreatedTime) - <any>new Date(a.notificationCreatedTime);
        })
        .slice();
    }
  };

  sortNotificationsByNotificationType = function() {
    if (this.selectedSortFlag == 'desc') {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return a.notificationTypeLabel.localeCompare(b.notificationTypeLabel);
        })
        .slice();
    } else {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return b.notificationTypeLabel.localeCompare(a.notificationTypeLabel);
        })
        .slice();
    }
  };
  sortNotificationsByPatient = function() {
    if (this.selectedSortFlag == 'desc') {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return a.notificationPatientLastName.localeCompare(b.notificationPatientLastName);
        })
        .slice();
    } else {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return b.notificationPatientLastName.localeCompare(a.notificationPatientLastName);
        })
        .slice();
    }
  };
  sortNotificationsByCareRep = function() {
    if (this.selectedSortFlag == 'desc') {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return a.notificationPatientLastName.localeCompare(b.notificationPatientLastName);
        })
        .slice();
    } else {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          return b.notificationPatientLastName.localeCompare(a.notificationPatientLastName);
        })
        .slice();
    }
  };
  sortNotificationsByStatus = function() {
    if (this.selectedSortFlag == 'desc') {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          const statusA = this.getDisplayStatus(a);
          const statusB = this.getDisplayStatus(b);
          return statusA.localeCompare(statusB);
        })
        .slice();
    } else {
      this.notificationsFiltered = this.notifications
        .sort((a: Notification, b: Notification) => {
          const statusA = this.getDisplayStatus(a);
          const statusB = this.getDisplayStatus(b);
          return statusB.localeCompare(statusA);
        })
        .slice();
    }
  };

  getDisplayStatus(notification: Notification): string {
    if (notification.replyCount && notification.replyCount > 0) {
      return 'Replied';
    }
    return notification.notificationStatusLabel || 'Unresolved';
  }

  onStatusChange(notification: Notification, newStatusLabelId: string) {
    this.notificationService.updateNotificationStatus(notification.notificationId, newStatusLabelId).subscribe(
      (updatedNotification: Notification) => {
        const index = this.notifications.findIndex(n => n.notificationId === notification.notificationId);
        if (index > -1) {
          this.notifications[index] = updatedNotification;
          this.runSortSwitch();
        }
      },
      error => {
        console.error('Error updating notification status', error);
      }
    );
  }

  searchNotifications($event: string): Notification[] {
    let searchText = $event;
    searchText = searchText.toLowerCase();
    this.notificationsFiltered = this.notifications.filter((notification: Notification) => {
      let patientFullName = notification.notificationPatientFirstName + ' ' + notification.notificationPatientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.notificationsFiltered;
  }
  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  trackByNotification(index: number, notification: Notification): string | number {
    return notification?.notificationId || index;
  }
}
