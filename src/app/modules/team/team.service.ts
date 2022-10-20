import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}

  getTeamMemberByTeamIdAndTeamMemberId = function(teamId: string, teamMemberId: string) {
    return this.http.get('teams/' + teamId + '/members/' + teamMemberId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  getTeamMembersByTeamId = function(teamId: string) {
    return this.http.get('teams/' + teamId + '/members/').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  getTeamMessagesByTeamId = function(teamId: string) {
    return this.http.get('teams/' + teamId + '/messages/').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  getTeams = function() {
    return this.http.get('teams').pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getTeamTotals = function() {
    return this.http.get('teams/totals').pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
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
        <strong>Error</strong>: We had trouble connecting to the team message service\
      </div>'
    );
  }
}
