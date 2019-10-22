import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Notification } from './notification';
import { NotificationService } from './notification.service';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NotificationResolver implements Resolve<Notification> {
  notification$: Promise<Notification>;
  constructor(private notificationService: NotificationService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Notification> {
    let notificationId = route.paramMap.get('notificationId');
    return this.notificationService.getNotificationByNotificationId(+notificationId).pipe(
      map((result: Notification) => {
        let notification = result[0];
        return notification;
      })
    );
  }
}
