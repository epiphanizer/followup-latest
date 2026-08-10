import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { retry, catchError, finalize, map, shareReplay, tap, timeout } from 'rxjs/operators';
import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {
  Notification,
  NotificationType,
  NotificationPostBody,
  NotificationRecipient,
  NotificationReply,
  NotificationStatusUpdateBody
} from './notification';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationTypesCache?: NotificationType[];
  private notificationTypesRequest$?: Observable<NotificationType[]>;

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
  getNotificationByNotificationId(notificationId: string): Observable<Notification> {
    return this.http.get<Notification>('notification/' + notificationId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationsByOperationId(operationId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>('notifications/operations/' + operationId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationsByPatientId(patientId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>('notifications/patient/' + patientId).pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationRecipientsByOperationIdAndNotificationTypeId(operationId: string, notificationTypeId: string) {
    return this.http
      .get<NotificationRecipient[]>('operations/' + operationId + '/notifications/' + notificationTypeId + '/recipients', {
        params: new HttpParams().set('_', Date.now().toString())
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  getNotificationTypes(): Observable<NotificationType[]> {
    if (this.notificationTypesCache) {
      return of(this.notificationTypesCache);
    }

    if (!this.notificationTypesRequest$) {
      this.notificationTypesRequest$ = this.http.get<NotificationType[]>('notifications/types').pipe(
        retry(3),
        timeout(15000),
        tap((notificationTypes: NotificationType[] | null) => {
          this.notificationTypesCache = notificationTypes || [];
        }),
        finalize(() => {
          this.notificationTypesRequest$ = undefined;
        }),
        catchError(e => {
          this.notificationTypesCache = undefined;
          return this.handleAsyncError(e);
        }),
        shareReplay(1)
      );
    }

    return this.notificationTypesRequest$;
  }
  saveNotificationByPatientId(patientId: string): Observable<any> {
    return this.http.post<Notification>('notifications/operations/' + patientId, {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  sendNotificationByNotificationId(notificationId: string): Observable<any> {
    return this.http
      .post<Notification>('notifications/send', {
        notificationId: notificationId
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  getNotificationRepliesByNotificationId(
    notificationId: string,
    skipGlobalLoader: boolean = false
  ): Observable<NotificationReply[]> {
    const requestOptions = skipGlobalLoader
      ? { context: new HttpContext().set(SKIP_GLOBAL_LOADER, true) }
      : {};

    return this.http.get<any>('notification/' + notificationId + '/replies', requestOptions).pipe(
      map(response => this.normalizeReplyCollection(response)),
      retry(3),
      catchError(e => this.handleAsyncError(e))
    );
  }

  getNotificationRepliesByPatientId(patientId: string): Observable<NotificationReply[]> {
    return this.http.get<any>('patient/' + patientId + '/notification-replies').pipe(
      map(response => this.normalizeReplyCollection(response)),
      retry(3),
      catchError(e => this.handleAsyncError(e))
    );
  }

  addNotificationReply(
    notificationId: string,
    patientId: string,
    operationId: string,
    replyBody: any
  ): Observable<any> {
    return this.http
      .post<any>(
        'notification/' + notificationId + '/patient/' + patientId + '/operation/' + operationId + '/reply',
        replyBody
      )
      .pipe(catchError(e => this.handleAsyncError(e)));
  }

  updateNotificationStatus(notificationId: string, statusLabelId: string): Observable<Notification> {
    const statusUpdateBody: NotificationStatusUpdateBody = {
      notificationStatusLabelId: statusLabelId
    };
    return this.http
      .put<Notification>('notification/' + notificationId, statusUpdateBody)
      .pipe(catchError(e => this.handleAsyncError(e)));
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

  private normalizeReplyCollection(response: any): NotificationReply[] {
    if (!response) {
      return [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.replies)) {
      return response.replies;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    return [];
  }
}
