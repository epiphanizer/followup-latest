import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AuthenticationService } from './auth.service';

describe('AuthenticationService', () => {
  const build = () => {
    const http = { post: jest.fn() } as any;
    const jwtHelper = { decodeToken: jest.fn() } as any;
    const operationService = {
      getOperationsByUserId: jest.fn(),
      getOperationGroups: jest.fn()
    } as any;

    const service = new AuthenticationService(http, jwtHelper, operationService);
    return { service, http, jwtHelper, operationService };
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in, decodes the token, and stores the hydrated user', async () => {
    const { service, http, jwtHelper, operationService } = build();
    const decoded = {
      expires: '2026-01-01',
      user: {
        userId: 1,
        userLevel: 'admin',
        operations: [],
        operationGroups: [{ operationGroupId: 1 }]
      }
    } as any;
    jwtHelper.decodeToken.mockReturnValue(decoded);
    operationService.getOperationsByUserId.mockReturnValue(
      of([
        { operationGroupId: 1, operationName: 'Zeta' },
        { operationGroupId: 1, operationName: 'Alpha' }
      ])
    );
    operationService.getOperationGroups.mockReturnValue(of([{ operationGroupId: 1 }]));
    http.post.mockReturnValue(of({ token: 'jwt-token' }));

    const result = await service.doLogin('alice', 'secret').toPromise();

    expect(result).toEqual(decoded);
    expect(operationService.getOperationsByUserId).toHaveBeenCalledWith(1);
    expect(operationService.getOperationGroups).toHaveBeenCalled();

    const storedUser = JSON.parse(localStorage.getItem('followup-user'));
    expect(storedUser.operations.length).toBeGreaterThan(0);
    expect(storedUser.operationGroups[0].operations.length).toBeGreaterThan(0);
    expect(service.currentUserValue.userId).toBe(1);
    expect(localStorage.getItem('followup-token')).toContain('expires');
  });

  it('returns an error observable when login fails', async () => {
    const { service, http } = build();
    http.post.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, error: 'boom' })));

    await expect(service.doLogin('bad', 'creds').toPromise()).rejects.toEqual(
      expect.objectContaining({ message: 'We had trouble within the authentication service.' })
    );
  });

  it('clears session data on logout', async () => {
    const { service, http } = build();
    localStorage.setItem('followup-user', JSON.stringify({ userId: 2 }));
    localStorage.setItem('followup-token', 'token');
    http.post.mockReturnValue(of({}));

    await service.doLogout('2').toPromise();

    expect(localStorage.getItem('followup-user')).toBeNull();
    expect(localStorage.getItem('followup-token')).toBeNull();
    expect(service.currentUserValue).toBeNull();
  });
});
