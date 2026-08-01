import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { take } from 'rxjs/operators';
import { NotificationService } from '../../notification.service';
import { Notification } from '../../notification';

@Component({
  selector: 'app-notification-patient-listing',
  templateUrl: './notification-patient-listing.component.html',
  styleUrls: ['./notification-patient-listing.component.scss'],
  standalone: false
})
export class NotificationPatientListingComponent implements OnInit {
  @Input() operation: Operation;
  public hasLoadedNotifications: boolean = false;
  public currentSearchText: string = '';
  public notifications: Notification[];
  public notificationsFiltered: Notification[];
  public pageOfItems: Notification[];
  // Default to sorting by notification date descending.
  public selectedSortFlag: string = 'desc';
  public colDefs = ['Date', 'Patient', 'Type', 'Care Rep', 'Status'];
  public selectedSortOption = this.colDefs[0];
  public statusOptions: { id: string; label: string }[] = [];

  constructor(private notificationService: NotificationService) {}
  ngOnInit() {
    this.notifications = [];
    this.notificationsFiltered = [];
    this.operation = this.operation;
    this.loadNotificationsForOperation(this.operation);
  }

  ngOnChanges(changes: any) {
    if (changes.operation) {
      this.notifications = [];
      this.notificationsFiltered = [];
      this.operation = changes.operation.currentValue;
      this.loadNotificationsForOperation(this.operation);
    }
  }

  get hasVisibleNotifications(): boolean {
    return Array.isArray(this.notificationsFiltered) && this.notificationsFiltered.length > 0;
  }

  get emptyStateMessage(): string {
    if (this.currentSearchText.trim().length > 0 && Array.isArray(this.notifications) && this.notifications.length > 0) {
      return 'No notifications match the current search.';
    }

    return 'No notifications have been created for this operation yet.';
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
    const currentStatus = String(notification?.notificationStatusLabel || '').trim();

    if (this.getReplyCount(notification) > 0) {
      if (currentStatus && currentStatus.toLowerCase() !== 'unresolved') {
        return currentStatus;
      }

      return 'Resolved';
    }

    return currentStatus || 'Unresolved';
  }

  getReplyCount(notification: Notification): number {
    const replyCount = Number(notification?.replyCount);
    if (!Number.isNaN(replyCount) && replyCount > 0) {
      return replyCount;
    }

    if (Array.isArray(notification?.notificationReplies)) {
      return notification.notificationReplies.length;
    }

    return 0;
  }

  getStatusSelectValue(notification: Notification): string {
    return notification?.notificationStatusLabelId || '';
  }

  hasEditableStatuses(): boolean {
    return this.statusOptions.length > 0;
  }

  onStatusSelectChange(notification: Notification, newStatusLabelId: string) {
    if (!notification || !newStatusLabelId || newStatusLabelId === notification.notificationStatusLabelId) {
      return;
    }
    this.onStatusChange(notification, newStatusLabelId);
  }

  onStatusChange(notification: Notification, newStatusLabelId: string) {
    if (!newStatusLabelId) {
      return;
    }

    this.notificationService.updateNotificationStatus(notification.notificationId, newStatusLabelId).subscribe(
      (updatedNotification: Notification | undefined) => {
        const index = this.notifications.findIndex(n => n.notificationId === notification.notificationId);
        if (index > -1) {
          const updatedStatus = this.statusOptions.find(option => option.id === newStatusLabelId);
          const fallbackNotification = {
            ...notification,
            notificationStatusLabelId: newStatusLabelId,
            notificationStatusLabel: updatedStatus?.label || notification.notificationStatusLabel
          } as Notification;

          this.notifications[index] = updatedNotification || fallbackNotification;
          this.rebuildStatusOptions(this.notifications);
          this.runSortSwitch();
        }
      },
      error => {
        console.error('Error updating notification status', error);
      }
    );
  }

  searchNotifications($event: string): Notification[] {
    this.currentSearchText = $event || '';
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

  private rebuildStatusOptions(notifications: Notification[] = []): void {
    const labelsById: { [key: string]: string } = {};

    notifications.forEach(notification => {
      const statusId = notification?.notificationStatusLabelId;
      const statusLabel = notification?.notificationStatusLabel;

      if (statusId && statusLabel) {
        labelsById[statusId] = statusLabel;
      }
    });

    this.statusOptions = Object.keys(labelsById)
      .map(id => ({ id, label: labelsById[id] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private loadNotificationsForOperation(operation: Operation | undefined): void {
    const operationId = operation?.operationId;

    this.hasLoadedNotifications = false;
    this.currentSearchText = '';

    if (!operationId) {
      this.statusOptions = [];
      this.hasLoadedNotifications = true;
      this.notificationsFiltered = this.notifications = [];
      return;
    }

    this.notificationService
      .getNotificationsByOperationId(operationId)
      .pipe(take(1))
      .subscribe(
        (notifications: Notification[]) => {
          this.applyNotifications(notifications);
        },
        () => {
          this.statusOptions = [];
          this.hasLoadedNotifications = true;
          this.notificationsFiltered = this.notifications = [];
        }
      );
  }

  private applyNotifications(notifications: Notification[] | null | undefined): void {
    this.notifications = Array.isArray(notifications) ? notifications : [];
    this.notificationsFiltered = this.notifications;
    this.rebuildStatusOptions(this.notifications);
    this.hasLoadedNotifications = true;
    this.runSortSwitch();
  }
}
