import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Notification, NotificationType, NotificationPostBody, NotificationRecipient } from './notification';

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
    return this.http.post<Notification>('notifications', notificationPostBody).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationByNotificationId(notificationId: number): Observable<Notification> {
    return this.http.get<Notification>('notification/' + notificationId).pipe(
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
  getNotificationsByPatientId(patientId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>('notifications/patient/' + patientId).pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationRecipientsByOperationIdAndNotificationTypeId(operationId: number, notificationTypeId: number) {
    return this.http
      .get<NotificationRecipient[]>(
        'operations/' + operationId + '/notifications/' + notificationTypeId + '/recipients'
      )
      .pipe(
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
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  sendNotificationByNotificationId(notificationId: number): Observable<any> {
    return this.http
      .post<Notification>('notifications/send', {
        notificationId: notificationId
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  handleAsyncError(error: HttpErrorResponse) {
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
