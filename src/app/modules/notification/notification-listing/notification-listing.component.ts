import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
import { Notification } from '../notification';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  selector: 'app-notification-listing',
  templateUrl: './notification-listing.component.html',
  styleUrls: ['./notification-listing.component.scss'],
  standalone: false
})
export class NotificationListingComponent implements OnInit {
  @Input() operation: Operation;
  filterBy: string;
  public notifications: Notification[];
  public notifications$: Observable<[Notification]> | void = null;
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  public selected:
    | {
        filterDate: string;
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  selectedSortFlag: string = 'asc';
  user: User;
  constructor(private notificationService: NotificationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (!this.route.snapshot.data.operation) {
      this.selected.operation = this.getDefaultOperationFromUser();
    } else {
      this.selected.operation = this.route.snapshot.data.operation || this.getDefaultOperationFromUser();
    }
  }

  handleDateFilterChangeEvent($event: string) {
    this.selected.filterDate = $event;
  }
  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
    this.notifications = [];
    this.notifications$ = this.notificationService
      .getNotificationsByOperationId(this.selected.operation.operationId)
      .pipe(
        map((notifications: [Notification]) => {
          this.notifications = notifications;
          return notifications;
        })
      );
  }

  private getDefaultOperationFromUser(): Operation | null {
    let firstAvailableOperation: Operation | null = null;

    for (const operationGroup of this.user?.operationGroups || []) {
      if (!operationGroup.operations || !operationGroup.operations.length) {
        continue;
      }

      if (!firstAvailableOperation) {
        firstAvailableOperation = operationGroup.operations[0];
      }

      const activeOperation = operationGroup.operations.find((operation: Operation) => Number(operation?.operationActive) !== 0);
      if (activeOperation) {
        return activeOperation;
      }
    }

    return firstAvailableOperation;
  }
}
