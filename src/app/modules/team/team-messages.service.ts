import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { TeamMessage } from './team';

@Injectable({
  providedIn: 'root'
})
export class TeamMessageService {
  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}

  getTeamMessagesByTeamId = function(teamId: number) {
    return this.http.get('team/' + teamId + '/messages/').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  sendTeamMessage = function(teamMessage: TeamMessage) {
    return this.http
      .post('team/' + teamMessage.teamId + '/messages/' + teamMessage.teamMessageRecipientId, {
        teamMessageFromId: teamMessage.teamMessageFromId,
        teamMessageRecipientId: teamMessage.teamMessageRecipientId,
        teamMessageContent: teamMessage.teamMessageContent
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };
}
