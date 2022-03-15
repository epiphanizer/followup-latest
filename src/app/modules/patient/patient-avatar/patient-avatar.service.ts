import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PatientAvatarService {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  getPatientAvatarByPatientId(patientId: string): Observable<any> {
    return this.http
      .get<any>('patients/' + patientId + '/avatar', { responseType: 'blob' as 'json' })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  uploadPatientAvatarByPatientId(patientId: string, file: File) {
    let formData = new FormData();
    formData.append('avatarBlob', file, file.name);
    return this.http.post('patients/' + patientId + '/avatar', formData).pipe(
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
