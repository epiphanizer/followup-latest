import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../user/user';
import {
  Operation,
  OperationPutBody,
  OperationGroup,
  OperationCallRep,
  OperationGroupPutBody
} from './operation';
import { Injectable } from '@angular/core';

@Injectable()
export class OperationService {
  constructor(private http: HttpClient) {}

  addNewOperation(): Observable<Operation> {
    return this.http.post<Operation>('operations', {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  addNewOperationGroup(operationGroupName: string, operationGroupShortName: string): Observable<OperationGroup> {
    return this.http
      .post<OperationGroup>('operations/groups', {
        operationGroupName: operationGroupName,
        operationGroupShortName: operationGroupShortName
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  editOperationGroupByOperationGroupId(
    operationGroupId: string,
    operationGroupPutBody: OperationGroupPutBody
  ): Observable<OperationGroup> {
    return this.http.put<OperationGroup>('operations/groups/' + operationGroupId, operationGroupPutBody).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  deactivateOperationGroupByOperationGroupId(operationGroupId: string): Observable<any> {
    return this.http.delete('operations/groups/' + operationGroupId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  restoreOperationGroupByOperationGroupId(operationGroupId: string): Observable<any> {
    return this.http.post('operations/groups/' + operationGroupId + '/restore', {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public assignManagerToOperationByOperationIdAndUserId(operationId: string, userId: string) {
    return this.http.post('operations/' + operationId + '/managers/' + userId, {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public getOperationGroups(): Observable<OperationGroup[]> {
    return this.http.get<OperationGroup[]>('operations/groups').pipe(
      map((operationGroups: OperationGroup[]) => {
        if (!localStorage.getItem('operationGroups')) {
          localStorage.setItem('operationGroups', JSON.stringify(operationGroups));
        }
        return operationGroups;
      }),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public getAllOperationGroups(): Observable<OperationGroup[]> {
    return this.http.get<OperationGroup[]>('operations/groups/all').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  public getOperationGroupByOperationGroupId(operationGroupId: string): Observable<OperationGroup> {
    return this.http.get<OperationGroup>('groups/' + operationGroupId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  public getActiveOperationsByOperationGroupId(operationGroup: OperationGroup, user: User): Observable<Operation[]> {
    var operationGroupId = operationGroup.operationGroupId;
    return this.http.get<Operation[]>('operations/groups/' + operationGroupId + '/active/' + user.userId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  public getOperationsByOperationGroupId(operationGroup: OperationGroup): Observable<Operation[]> {
    var operationGroupId = operationGroup.operationGroupId;
    return this.http.get<Operation[]>('operations/groups/' + operationGroupId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  public removeCallRepOrManager(operationId: string, userId: string) {
    return this.http.delete('operations/' + operationId + '/callReps/' + userId, {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  public removeManagerByOperationIdAndUserId(operationId: string, userId: string) {
    return this.http.delete('operations/' + operationId + '/managers/' + userId, {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  public editOperationByOperationId(operationId: string, operationPutBody: OperationPutBody): Observable<Operation> {
    return this.http.put<Operation>('operations/' + operationId, operationPutBody).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  /**
   * We need to make sure this only gives us back the ones we need.
   */
  public getAllOperations(): Observable<Array<Operation>> {
    return this.http.get<Array<Operation>>('operations').pipe(catchError(error => this.handleAsyncError(error)));
  }

  public getOperationByOperationId(operationId: string): Observable<Operation> {
    return this.http
      .get<Operation>('operations/' + operationId)
      .pipe(catchError(error => this.handleAsyncError(error)));
  }

  public getOperationsByUserId(userId: string): Observable<Array<Operation>> {
    return this.http
      .get<Array<Operation>>('users/' + userId + '/operations')
      .pipe(catchError(error => this.handleAsyncError(error)));
  }

  public getUsersAssignedByOperationId(operationId: string): Observable<User[] | OperationCallRep[]> {
    return this.http
      .get<Array<User>>('operations/' + operationId + '/users')
      .pipe(catchError(error => this.handleAsyncError(error)));
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
    var backendError = error && error.error;
    var backendMessage = '';
    if (typeof backendError === 'string') {
      backendMessage = backendError;
    } else if (backendError && typeof backendError.message === 'string') {
      backendMessage = backendError.message;
    }

    // return an observable with a user-facing error message
    return throwError({
      status: error.status,
      message:
        'We had trouble connecting to the operation API route. \
    Please contact your IT department and relay this message.',
      detail: backendMessage
    });
  }
}
