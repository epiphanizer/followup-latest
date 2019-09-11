import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface Notification {
  notificationId: number;
  notificationTypeId: number;
  notificationTypeLabel?: string;
  notificationRecipients?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotificationsByOperationId(operationId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>('notifications/operations/' + operationId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getNotificationStatusLabels(): Observable<Notification[]> {
    return this.http.get<Notification[]>('notifications/statuses').pipe(
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
        <strong>Error</strong>: We had trouble connecting to the patient service\
      </div>'
    );
  }
}
