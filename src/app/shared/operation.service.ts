import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface Operation {
  operationId: number;
  operationName: string;
}

export interface OperationInformation {
  operationId: number;
  operationName: string;
  operationAddress: string;
  operationCity: string;
  operationState: string;
  operationZip: string;
  operationCurrentDischargeCount: number;
}

export class OperationService {
  constructor(private http: HttpClient) {}

  getOperations(): Observable<Operation> {
    return this.http.get<Operation>('operations').pipe(
      retry(1), // retry a failed request up to 2 total times
      catchError(error => this.handleAsyncError(error))
    );
  }

  getOperationInformationByOperationId(operationId: number): Observable<OperationInformation> {
    return this.http.get<OperationInformation>('operations/' + operationId).pipe(
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
