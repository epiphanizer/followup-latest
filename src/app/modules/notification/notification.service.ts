import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Notification, NotificationType, NotificationPostBody } from './notification';
// import { NotificationRecipientPostBody } from './notification-recipient/notification-recipient.service';
import { User } from '@app/user';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) {}
  addNotificationByOperationIdAndNotificationTypeId(notification: Notification): Observable<Notification> {
    let notificationPostBody: NotificationPostBody = {
      notificationCreatedByUserId: notification.notificationCreatedByUserId,
      notificationTypeId: notification.notificationTypeId,
      notificationOperationId: notification.notificationOperationId,
      notificationMessage: notification.notificationMessage,
      notificationPatientId: notification.notificationPatientId
    };
    return this.http.post<Notification>('notifications', { notificationPostBody }).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationsByOperationId(operationId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>('notifications/operations/' + operationId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationTypes(): Observable<NotificationType[]> {
    return this.http.get<NotificationType[]>('notifications/types').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  saveNotificationByPatientId(patientId: number): Observable<any> {
    return this.http.post<Notification>('notifications/operations/' + patientId, {}).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  sendNotificationByNotificationId(notificationId: number): Observable<any> {
    return this.http
      .post<Notification>('notifications/' + notificationId, {
        notificationStatusLabelId: 1
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  private handleAsyncError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      '<div class="alert alert-danger" role="alert"> \
        <strong>Error</strong>: We had trouble connecting to the notification service\
      </div>'
    );
  }
}
