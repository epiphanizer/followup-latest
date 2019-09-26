import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation.service';
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
  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notifications$ = this.notificationService.getNotificationsByOperationId(this.operation.operationId).pipe(
      map((notifications: Notification[]) => {
        this.notifications = notifications;
        return notifications;
      })
    );
  }

  /**
   * Our sorter functions
   */
  toggleAscDesc() {
    alert('Toggled ascending vs. descending');
  }
  sortNotificationsByDate() {
    alert('Toggling notifications by date');
  }
  sortNotificationsByType() {
    alert('Toggling notifications by type');
  }
  sortNotificationsByPatient() {
    alert('Toggling notifications by patient');
  }
  sortNotificationsByStatus() {
    alert('Toggling notifications by status');
  }
}
