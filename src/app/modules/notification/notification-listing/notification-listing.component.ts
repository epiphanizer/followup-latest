import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation.service';
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';
import { NotificationService, Notification } from '../notification.service';
import { map } from 'rxjs/operators';
import { User } from '@app/user';

@Component({
  selector: 'app-notification-listing',
  templateUrl: './notification-listing.component.html',
  styleUrls: ['./notification-listing.component.scss']
})
export class NotificationListingComponent implements OnInit {
  @Input() operation: Operation;

  public notifications: Notification[];
  public notifications$: Observable<[Notification]> | void = null;
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(private notificationService: NotificationService) {}

  ngOnInit() {}

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.operation = changes.operation.currentValue;
      this.notifications$ = this.notificationService.getNotificationsByOperationId(this.operation.operationId).pipe(
        map((notifications: [Notification]) => {
          this.notifications = notifications;
          return notifications;
        })
      );
    }
  }

  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
  }
}
