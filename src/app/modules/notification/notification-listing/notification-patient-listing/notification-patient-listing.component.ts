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
  public notificationsFiltered: Notification[];
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

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.notifications = [];
      this.operation = changes.operation.currentValue;
      this.notifications$ = this.notificationService.getNotificationsByOperationId(this.operation.operationId).pipe(
        map((notifications: [Notification]) => {
          this.notifications = notifications;
          return notifications;
        })
      );
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
      this.notifications.sort((a: Notification, b: Notification) => {
        return <any>new Date(a.notificationCreatedDate) - <any>new Date(b.notificationCreatedDate);
      });
    } else {
      this.notifications.sort((a: Notification, b: Notification) => {
        return <any>new Date(b.notificationCreatedDate) - <any>new Date(a.notificationCreatedDate);
      });
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
  sortNotificationsByStatus = function(sortFlag: string) {
    this.filterBy = 'status';
    alert('Toggling notifications by status');
  };

  searchPatientNotifications($event: KeyboardEvent): Notification[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.notificationsFiltered = this.notifications.filter((notification: Notification) => {
      let patientFullName = notification.notificationPatientFirstName + ' ' + notification.patientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.notificationsFiltered;
  }
}
