import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientAvatarService {
  private avatarRequestCache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}
  getPatientAvatarByPatientId(patientId: string): Observable<any> {
    const cacheKey = String(patientId);
    const existingRequest = this.avatarRequestCache.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }

    const request$ = this.http
      .get<any>('patients/' + patientId + '/avatar', { responseType: 'blob' as 'json' })
      .pipe(
        shareReplay(1),
        catchError(e => {
          this.avatarRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        })
      );

    this.avatarRequestCache.set(cacheKey, request$);
    return request$;
  }

  uploadPatientAvatarByPatientId(patientId: string, file: File) {
    const cacheKey = String(patientId);
    let formData = new FormData();
    formData.append('avatarBlob', file, file.name);
    return this.http.post('patients/' + patientId + '/avatar', formData).pipe(
      tap(() => this.avatarRequestCache.delete(cacheKey)),
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
