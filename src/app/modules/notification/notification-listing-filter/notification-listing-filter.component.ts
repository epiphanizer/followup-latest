import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '@app/modules/user/user.service';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from '@app/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientService } from '@app/modules/patient/patient.service';
import { Operation } from '@app/modules/operation/operation';
import { NotificationService } from '../notification.service';
import { Notification } from '../notification';

@Component({
  providers: [AuthenticationService, PatientService, UserService],
  selector: 'app-notification-listing-filter',
  templateUrl: './notification-listing-filter.component.html',
  styleUrls: ['./notification-listing-filter.component.scss']
})
export class NotificationListingFilterComponent implements OnInit {
  @Input() operation: Operation;
  @Input() notifications: Notification[];
  notificationsFiltered: Notification[] = [];
  user: User;
  patients: Array<Patient> = [];
  patients$: Observable<Patient[]>;
  todaysDate: string;

  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notificationService
      .getNotificationsByOperationId(this.operation.operationId)
      .subscribe((notifications: Notification[]) => {
        if (!notifications) {
          this.notifications = [];
        }
        this.notifications = notifications;
        // this.searchNotificationsBySelectedDate(this.filterDate);
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.notifications) {
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
            // this.searchNotificationsBySelectedDate(;
          });
      }
    }
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
