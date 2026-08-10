import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { NotificationRecipient, NotificationType } from '../notification';

export interface NotificationRecipientPostBody {}

@Injectable({
  providedIn: 'root'
})
export class NotificationRecipientService {
  constructor(private http: HttpClient) {}

  addNotificationRecipientByOperationContactId(notificationReceipientPostBody: NotificationRecipientPostBody) {
    return this.http
      .post<NotificationRecipientPostBody>('notifications/recipients/', notificationReceipientPostBody)
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  getNotificationRecipientByOperationContactId(notificationOperationContactId: string) {
    return this.http
      .get<NotificationType[]>('notifications/contacts/' + notificationOperationContactId, {
        params: new HttpParams().set('_', Date.now().toString())
      })
      .pipe(
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
        <strong>Error</strong>: We had trouble connecting to the patient service\
      </div>'
    );
  }
}
