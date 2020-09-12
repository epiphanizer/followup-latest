import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AuthenticationService, HttpService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { share, catchError } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class DataResolver implements Resolve<any> {
  constructor(private authService: AuthenticationService, private http: HttpService) {}
  resolve(): any {
    debugger;
    alert('resolving data');
    if (!this.authService.currentUserValue) {
      window.location.href = '/login';
    } else {
      this.getData().subscribe(data => {
        console.log(data);
        debugger;
      });
    }
  }
  getData(): Observable<User> {
    console.log('getting data');
    return this.http.get<User>('data').pipe(
      share(),
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
      message: 'We had trouble within the authentication service.'
    });
  }
}
