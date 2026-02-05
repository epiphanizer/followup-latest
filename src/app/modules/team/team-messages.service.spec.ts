import { of } from 'rxjs';
import { TeamMessageService } from './team-messages.service';

describe('TeamMessageService (Jest)', () => {
  const makeHttp = () => ({
    get: jest.fn(() => of([] as any)),
    post: jest.fn(() => of({ created: true } as any))
  });

  it('gets team messages by team id', done => {
    const http = makeHttp();
    const svc = new TeamMessageService(http as any);

    svc.getTeamMessagesByTeamId(1).subscribe((result: any) => {
      expect(result).toEqual([]);
      expect(http.get).toHaveBeenCalledWith('teams/1/messages/');
      done();
    });
  });

  it('sends a team message', done => {
    const http = makeHttp();
    const svc = new TeamMessageService(http as any);
    const message = { messageSenderUserId: 's', messageRecipientUserId: 'r', messageBody: 'hi' } as any;

    svc.sendTeamMessage('2', message).subscribe((result: any) => {
      expect(result).toEqual({ created: true });
      expect(http.post).toHaveBeenCalledWith('teams/2/messages/', {
        teamMessageFromId: 's',
        teamMessageRecipientId: 'r',
        teamMessageContent: 'hi'
      });
      done();
    });
  });
});
