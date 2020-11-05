import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
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
  public filterBy: string = 'notification-date';
  public selectedSortFlag: string = 'desc';

  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notificationService
      .getNotificationsByOperationId(this.operation.operationId)
      .pipe(
        take(1),
        map((notifications: Notification[]) => {
          if (notifications) {
            this.sortNotificationsByNotificationDate(this.selectedSortFlag);
          }
          this.notifications = notifications;
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
            this.notifications = notifications;
            this.notificationsFiltered = notifications;
          })
        )
        .subscribe();
    }
  }
  toggleAscDesc() {
    if (this.selectedSortFlag == 'asc') {
      this.selectedSortFlag = 'desc';
    } else {
      this.selectedSortFlag = 'asc';
    }

    if (this.filterBy == 'notification-date') {
      this.sortNotificationsByNotificationDate(this.selectedSortFlag);
    } else if (this.filterBy == 'patient-name') {
      this.sortNotificationsByPatient(this.selectedSortFlag);
    } else if (this.filterBy == 'notification-type') {
      this.sortNotificationsByNotificationType(this.selectedSortFlag);
    }
  }
  public sortNotificationsByNotificationDate = function(sortFlag: string) {
    this.filterBy = 'notification-date';
    if (sortFlag == 'asc') {
      this.notificationsFiltered = this.notifications;
      this.notificationsFiltered.sort((a: Notification, b: Notification) => {
        return <any>new Date(a.notificationCreatedTime) - <any>new Date(b.notificationCreatedTime);
      });
    } else {
      this.notificationsFiltered = this.notifications;
      this.notificationsFiltered.sort((a: Notification, b: Notification) => {
        return <any>new Date(b.notificationCreatedTime) - <any>new Date(a.notificationCreatedTime);
      });
      console.log(this.notificationsFiltered);
    }
  };

  sortNotificationsByNotificationType = function(sortFlag: string) {
    this.filterBy = 'notification-type';
    if (sortFlag == 'desc') {
      this.notifications.sort((a: Notification, b: Notification) => {
        return a.notificationTypeLabel.localeCompare(b.notificationTypeLabel);
      });
    } else {
      this.notifications.sort((a: Notification, b: Notification) => {
        return b.notificationTypeLabel.localeCompare(a.notificationTypeLabel);
      });
    }
  };
  sortNotificationsByPatient = function(sortFlag: string) {
    this.filterBy = 'patient-name';
    if (sortFlag == 'desc') {
      this.notifications.sort((a: Notification, b: Notification) => {
        return a.notificationPatientLastName.localeCompare(b.notificationPatientLastName);
      });
    } else {
      this.notifications.sort((a: Notification, b: Notification) => {
        return b.notificationPatientLastName.localeCompare(a.notificationPatientLastName);
      });
    }
  };

  searchNotifications($event: KeyboardEvent): Notification[] {
    let searchText = $event.currentTarget['value'];
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
}
