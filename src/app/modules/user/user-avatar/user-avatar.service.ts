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
    return this.http.get<any>('users/' + userId + '/avatar').pipe(
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

  prepareAvatarImage(baseImage: any): SafeUrl {
    // @see https://medium.com/@koteswar.meesala/convert-array-buffer-to-base64-string-to-display-images-in-angular-7-4c443db242cd
    let TYPED_ARRAY = new Uint8Array(baseImage[0].userAvatarBlob.data);
    const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(STRING_CHAR);
    let avatarUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
    return avatarUrl;
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
