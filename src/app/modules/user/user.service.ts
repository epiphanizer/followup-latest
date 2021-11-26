import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, share } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserPutObject, User, UserLanguage, UserMessage } from './user';
import { TeamMessage } from '../team/team';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  deactivateUserByUserId(userId: string) {
    return this.http.delete('users/' + userId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('users').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getAllManagerUsers(): Observable<User[]> {
    return this.http.get<User[]>('users/managers').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getAllAdminUsers(): Observable<User[]> {
    return this.http.get<User[]>('users/admins').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getUserByUserId(userId: string) {
    return this.http.get<User>('users/' + userId).pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public getUserCalls(user: User): Observable<any> {
    var userId = user.userId;
    return this.http.get<Blob>('users/' + userId + '/calls').pipe(
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  public getUserCallCount(user: User): Observable<any> {
    var userId = user.userId;
    return this.http.get<Blob>('users/' + userId + '/calls/count').pipe(
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  public getUserMessages(user: User): Observable<UserMessage[]> {
    var userId = user.userId;
    return this.http.get<UserMessage[]>('users/' + userId + '/messages').pipe(
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  public sendUserMessage(userMessage: UserMessage): Observable<any> {
    var userId = userMessage.messageRecipientUserId;
    return this.http
      .post<UserMessage[]>('users/' + userId + '/messages', {
        messageSenderUserId: userMessage.messageSenderUserId,
        messageRecipientUserId: userMessage.messageRecipientUserId,
        messageBody: userMessage.messageBody
      })
      .pipe(
        share(),
        catchError(error => this.handleAsyncError(error))
      );
  }
  public getUserNotifications(user: User): Observable<any> {
    var userId = user.userId;
    return this.http.get<Blob>('users/' + userId + '/notifications').pipe(
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  getUserLanguagesByUserId(userId: string) {
    return this.http.get<UserLanguage[]>('users/' + userId + '/languages').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  updateUserByUserId(userId: string, userPutObject: UserPutObject) {
    return this.http.put<UserPutObject>('users/' + userId, userPutObject).pipe(
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
