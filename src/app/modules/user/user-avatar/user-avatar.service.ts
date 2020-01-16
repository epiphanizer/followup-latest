import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * A class for talking to the user avatar API
 */
@Injectable()
export class UserAvatarService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  getUserAvatarByUserId(userId: number): Observable<any> {
    return this.http.get<any>('users/' + userId + '/avatar', { responseType: 'blob' as 'json' }).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  uploadUserAvatarByUserId(userId: number, file: File) {
    let formData = new FormData();
    formData.append('avatarBlob', file, file.name);
    return this.http.post('users/' + userId + '/avatar', formData).pipe(
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
    return throwError(error);
  }
}
