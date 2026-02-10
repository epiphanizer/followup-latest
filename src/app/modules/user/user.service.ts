import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, share } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserPutObject, User, UserLanguage, UserMessage } from './user';
import { TeamMessage } from '../team/team';
import { OperationService } from '../operation/operation.service';
import { Operation, OperationGroup } from '../operation/operation';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private operationService: OperationService) {}

  deactivateUserByUserId(userId: string) {
    return this.http.delete('users/' + userId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('users').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getActiveUsers(): Observable<User[]> {
    return this.http.get<User[]>('users/active').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  // getAllManagerUsers(): Observable<User[]> {
  //   return this.http.get<User[]>('users/managers').pipe(
  //     catchError(e => this.handleAsyncError(e)) // then handle the error
  //   );
  // }
  getAllAdminUsers(): Observable<User[]> {
    return this.http.get<User[]>('users/admins').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getUserByUserId(userId: string) {
    return this.http.get<User>('users/' + userId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  impersonateUser(adminUserId: string, userId: string) {
    return this.http
      .post<User>('users/impersonate', {
        adminUserId: adminUserId,
        userId: userId
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 405) {
            return this.http.get<User>('users/' + userId);
          }
          return this.handleAsyncError(error);
        })
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

  updateOperations(user: User) {
    var _this = this;
    return new Promise(function(resolve, reject) {
      _this.operationService.getOperationsByUserId(user.userId).subscribe((res: any) => {
        if (res) {
          user.operations = res;
        }
        _this.operationService.getOperationGroups().subscribe((res: any) => {
          if (res) {
            user.operationGroups = res;
          }
          user.operationGroups.forEach((operationGroup: OperationGroup) => {
            // Could use a stronger approach but this does the trick

            operationGroup.operations = user.operations
              .filter((operation: Operation) => {
                return operationGroup.operationGroupId == operation.operationGroupId;
              })
              .sort(function(a: Operation, b: Operation) {
                if (a.operationName < b.operationName) {
                  return -1;
                }
                if (a.operationName > b.operationName) {
                  return 1;
                }
                return 0;
              });
          });

          user.operationGroups = user.operationGroups.filter((operationGroup: OperationGroup) => {
            return operationGroup.operations?.length > 0;
          });
          localStorage.setItem('followup-user', JSON.stringify(user));
          resolve(true);
        });
      });
    });
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
