import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../notification.service';
import { Notification } from '../notification';

@Component({
  providers: [AuthenticationService, DatePipe, PatientService, UserService],
  selector: 'app-notification-listing-filter',
  templateUrl: './notification-listing-filter.component.html',
  styleUrls: ['./notification-listing-filter.component.scss']
})
export class NotificationListingFilterComponent implements OnInit {
  @Input() operation: Operation;
  @Input() filterDate: string;
  @Input() notifications: Notification[];
  notificationsFiltered: Notification[] = [];
  user: User;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  todaysDate: string;

  constructor(private notificationService: NotificationService, private datePipe: DatePipe) {}
  ngOnInit() {
    this.notificationService
      .getNotificationsByOperationId(this.operation.operationId)
      .subscribe((notifications: Notification[]) => {
        if (!notifications) {
          this.notifications = [];
        }
        this.notifications = notifications;
        this.searchNotificationsBySelectedDate(this.filterDate);
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.notifications) {
      if (changes.filterDate) {
        this.filterDate = changes.filterDate.currentValue;
        this.searchNotificationsBySelectedDate(this.filterDate);
      }
    }
    if (this.operation) {
      if (changes.operation) {
        this.notificationService
          .getNotificationsByOperationId(this.operation.operationId)
          .subscribe((notifications: Notification[]) => {
            if (!notifications) {
              this.notifications = [];
            }
            this.notifications = notifications;
            this.searchNotificationsBySelectedDate(this.filterDate);
          });
      }
    }
  }

  searchNotificationsBySelectedDate(selectedDate: string): Notification[] {
    let selectedDateObj = new Date(selectedDate);
    let transformedDate = this.datePipe.transform(selectedDateObj, 'yyyy-MM-dd');
    if (this.notifications) {
      this.notificationsFiltered = this.notifications.filter((notification: Notification) => {
        if (notification.notificationCreatedTime) {
          return notification.notificationCreatedTime.toString().indexOf(transformedDate) !== -1;
        } else {
          return notification.notificationCreatedTime.toString().indexOf(transformedDate) !== -1;
        }
      });
    }
    return this.notificationsFiltered;
  }
  searchNotificationPatientsByText($event: KeyboardEvent): Notification[] {
    let searchText = $event.currentTarget['value'];
    searchText = searchText.toLowerCase();
    this.notificationsFiltered = this.notifications.filter((notification: Notification) => {
      let patientFullName = notification.notificationPatientFirstName + ' ' + notification.notificationPatientLastName;
      return patientFullName.toLowerCase().includes(searchText);
    });
    return this.notificationsFiltered;
  }
}
