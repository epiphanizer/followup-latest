import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { TeamMessage } from './team';
import { UserMessage } from '../user/user';

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
    return this.http.get('teams/' + teamId + '/messages/').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  sendTeamMessage = function(userMessage: UserMessage) {
    return this.http
      .post('teams/1/messages/', {
        teamMessageFromId: userMessage.messageSenderUserId,
        teamMessageRecipientId: userMessage.messageRecipientUserId,
        teamMessageContent: userMessage.messageBody
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };
}
