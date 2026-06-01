import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  TeamMemberOperationAccessEntry,
  TeamMemberOperationAccessPutItem,
  TeamOperationAssignment,
  TeamOperationAssignmentPutItem
} from './team';

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

  addTeam = function(teamName: string) {
    return this.http
      .post('teams', {
        teamName: teamName,
        teamActive: 1
      })
      .pipe(catchError(e => this.handleAsyncError(e)));
  };

  editTeamByTeamId = function(teamId: string, payload: { teamName: string; teamActive?: number }) {
    return this.http.put('teams/' + teamId, payload).pipe(catchError(e => this.handleAsyncError(e)));
  };

  deactivateTeamByTeamId = function(teamId: string, options?: { teamName?: string; cascadePermissions?: boolean }) {
    const body = {
      teamName: options?.teamName || '',
      cascadePermissions: options?.cascadePermissions !== false
    };

    return this.http.delete('teams/' + teamId, { body }).pipe(catchError(e => this.handleAsyncError(e)));
  };

  getTeamTotals = function() {
    return this.http.get('teams/totals').pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getTeamOperationAssignmentsByTeamId = function(teamId: string) {
    return this.http.get('teams/' + teamId + '/operations').pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e))
    );
  };

  setTeamOperationAssignmentsByTeamId = function(teamId: string, assignments: TeamOperationAssignmentPutItem[]) {
    return this.http.put('teams/' + teamId + '/operations', { assignments }).pipe(
      catchError(e => this.handleAsyncError(e))
    );
  };

  getTeamMemberOperationAccessByTeamIdAndTeamMemberId = function(teamId: string, teamMemberId: string) {
    return this.http.get('teams/' + teamId + '/members/' + teamMemberId + '/operations').pipe(
      retry(3),
      catchError(e => this.handleAsyncError(e))
    );
  };

  setTeamMemberOperationAccessByTeamIdAndTeamMemberId = function(
    teamId: string,
    teamMemberId: string,
    assignments: TeamMemberOperationAccessPutItem[]
  ) {
    return this.http.put('teams/' + teamId + '/members/' + teamMemberId + '/operations', { assignments }).pipe(
      catchError(e => this.handleAsyncError(e))
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
