import { of } from 'rxjs';
import { UserService } from './user.service';

describe('UserService (Jest)', () => {
  beforeEach(() => localStorage.clear());

  const makeHttp = () => ({
    delete: jest.fn(() => of({ deleted: true } as any)),
    get: jest.fn(() => of([] as any)),
    post: jest.fn(() => of({ created: true } as any)),
    put: jest.fn(() => of({ updated: true } as any))
  });

  it('deactivates user by id', done => {
    const http = makeHttp();
    const svc = new UserService(http as any, {} as any);

    svc.deactivateUserByUserId('u1').subscribe((result: any) => {
      expect(result).toEqual({ deleted: true });
      expect(http.delete).toHaveBeenCalledWith('users/u1');
      done();
    });
  });

  it('loads active users', done => {
    const http = makeHttp();
    const svc = new UserService(http as any, {} as any);

    svc.getActiveUsers().subscribe((result: any) => {
      expect(result).toEqual([]);
      expect(http.get).toHaveBeenCalledWith('users/active');
      done();
    });
  });

  it('sends user message', done => {
    const http = makeHttp();
    const svc = new UserService(http as any, {} as any);
    const message = { messageSenderUserId: 's', messageRecipientUserId: 'r', messageBody: 'body' } as any;

    svc.sendUserMessage(message).subscribe((result: any) => {
      expect(result).toEqual({ created: true });
      expect(http.post).toHaveBeenCalledWith('users/r/messages', {
        messageSenderUserId: 's',
        messageRecipientUserId: 'r',
        messageBody: 'body'
      });
      done();
    });
  });

  it('updates operations on user and persists', async () => {
    const http = makeHttp();
    const operationService = {
      getOperationsByUserId: jest.fn(() =>
        of([
          { operationId: 'op2', operationGroupId: 'og1', operationName: 'B' } as any,
          { operationId: 'op1', operationGroupId: 'og1', operationName: 'A' } as any
        ])
      ),
      getOperationGroups: jest.fn(() => of([{ operationGroupId: 'og1', operations: [] } as any]))
    } as any;
    const svc = new UserService(http as any, operationService as any);
    const user: any = { userId: 'u1', operations: [], operationGroups: [] };

    const result = await svc.updateOperations(user);

    expect(result).toBe(true);
    expect(user.operations.map((o: any) => o.operationId)).toEqual(['op2', 'op1']);
    expect(user.operationGroups[0].operations[0].operationName).toBe('A');
    expect(localStorage.getItem('followup-user')).toContain('op1');
  });
});
