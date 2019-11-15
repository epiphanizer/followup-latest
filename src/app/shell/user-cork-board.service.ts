import { Injectable } from '@angular/core';
import { HttpService } from '../core';
import { catchError, retry, delay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';

export interface UserCorkBoardObject {
  userCorkBoardObjectId: number;
  userCorkBoardFile: File;
}

@Injectable({
  providedIn: 'root'
})
/**
 * Provides helper methods to create routes.
 */
export class UserCorkBoardService {
  constructor(private http: HttpService) {}

  addNewUserCorkBoardObjectByUserId(userId: number, file: File) {
    let formData = new FormData();
    formData.append('userCorkBoardBlob', file, file.name);
    return this.http.post('users/' + userId + '/corkBoardObjects', formData).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getUserCorkBoardObjectsByUserId(userId: number) {
    return this.http.get('users/' + userId + '/corkBoardObjects').pipe(
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
