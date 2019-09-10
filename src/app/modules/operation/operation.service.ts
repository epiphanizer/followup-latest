import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { OperationContact } from './operation-contact/operation-contact';
import { OperationCallRep } from './operation-callreps.service';

export interface Operation {
  operationId: number;
  operationName: string;
  operationAddress: string;
  operationCity: string;
  operationState: string;
  operationZip: string;
  operationContacts$: Observable<OperationContact[]>;
  operationAssignedManagerUserId?: number;
  operationAssignedManagerName?: string;
  operationCallReps$: Observable<OperationCallRep[]>;
  /**
   * Some counters that don't always
   * attach to the object,
   * but are nice to have when the time comes.
   */
  currentAssignedPatientCount?: number;
  currentNewNotificationCount?: number;
  currentNewDischargeCount?: number;
}

export class OperationService {
  constructor(private http: HttpClient) {}

  addNewOperation(): Observable<Operation> {
    return this.http.post<Operation>('operations', {}).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  /**
   * We need to make sure this only gives us back the ones we need.
   */
  public getAllOperations(): Observable<Array<Operation>> {
    return this.http.get<Array<Operation>>('operations').pipe(
      retry(1), // retry a failed request up to 2 total times
      catchError(error => this.handleAsyncError(error))
    );
  }

  public getOperationByOperationId(operationId: number): Observable<Operation> {
    return this.http.get<Operation>('operations/' + operationId).pipe(
      retry(1), // retry a failed request up to 2 total times
      catchError(error => this.handleAsyncError(error))
    );
  }

  public getOperationsByUserId(userId: number): Observable<Array<Operation>> {
    return this.http.get<Array<Operation>>('users/' + userId + '/operations').pipe(
      retry(1), // retry a failed request up to 2 total times
      catchError(error => this.handleAsyncError(error))
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
    return throwError({
      message:
        'We had trouble connecting to the operation API route. \
    Please contact your IT department and relay this message.'
    });
  }
}
