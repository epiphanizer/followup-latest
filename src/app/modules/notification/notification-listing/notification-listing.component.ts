import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
import { Notification } from '../notification';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';

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
  constructor(private notificationService: NotificationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.user.operations$
      .subscribe((data: Operation[]) => {
        /** Init to the first assigned operation alphabetically */
        this.selected.operation = data[0];
      })
      .unsubscribe();
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

  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
    debugger;
    this.notifications$ = this.notificationService
      .getNotificationsByOperationId(this.selected.operation.operationId)
      .pipe(
        map((notifications: [Notification]) => {
          this.notifications = notifications;
          return notifications;
        })
      );
  }
}
