import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { OperationContact } from './operation-contact/operation-contact';

export interface OperationContactPutBody {
  operationContactId: number;
  operationContactFirstName: string;
  operationContactMiddleName: string;
  operationContactLastName: string;
  operationContactCountryCode: string;
  operationContactAreaCode: string;
  operationContactPhoneNumber: string;
  operationContactEmail: string;
  operationContactTitle: string;
}
export interface OperationContactPostBody {
  operationContactFirstName: string;
  operationContactMiddleName: string;
  operationContactLastName: string;
  operationContactCountryCode: string;
  operationContactAreaCode: string;
  operationContactPhoneNumber: string;
  operationContactEmail: string;
  operationContactTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationContactsService {
  constructor(private http: HttpClient) {}

  public addOperationContactByOperationId(
    operationId: number,
    payload: OperationContactPostBody
  ): Observable<OperationContact> {
    return this.http.post<OperationContact>('operations/' + operationId + '/contacts', payload).pipe(
      retry(1), // retry a failed request up to 2 total times
      catchError(error => this.handleAsyncError(error))
    );
  }
  public editOperationContactByOperationContactId(
    operationId: number,
    operationContactId: number,
    payload: OperationContactPutBody
  ): Observable<OperationContact> {
    return this.http
      .post<OperationContact>('operations/' + operationId + '/contacts/' + operationContactId, payload)
      .pipe(
        retry(1), // retry a failed request up to 2 total times
        catchError(error => this.handleAsyncError(error))
      );
  }
  public getOperationContactsByOperationId(operationId: number) {
    return this.http.get<OperationContact[]>('operations/' + operationId + '/contacts').pipe(
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
