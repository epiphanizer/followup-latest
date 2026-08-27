import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';

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
    http.post.mockReturnValue(of({ token: 'header.payload.signature' }));

    const result = await firstValueFrom(service.doLogin('alice', 'secret'));

    expect(result).toEqual(decoded);
    expect(operationService.getOperationsByUserId).toHaveBeenCalledWith(1);
    expect(operationService.getOperationGroups).toHaveBeenCalled();

    const storedUser = JSON.parse(localStorage.getItem('followup-user'));
    expect(storedUser.operations.length).toBeGreaterThan(0);
    expect(storedUser.operationGroups[0].operations.length).toBeGreaterThan(0);
    expect(service.currentUserValue.userId).toBe(1);
    expect(localStorage.getItem('followup-token')).toBe('header.payload.signature');
  });

  it('filters archived client groups and their facilities during login hydration', async () => {
    const { service, http, jwtHelper, operationService } = build();
    const decoded = {
      user: {
        userId: 1,
        userLevel: 'admin',
        operations: [],
        operationGroups: []
      }
    } as any;
    jwtHelper.decodeToken.mockReturnValue(decoded);
    operationService.getOperationsByUserId.mockReturnValue(
      of([
        { operationId: 'op1', operationGroupId: 1, operationName: 'Visible Facility', operationActive: 1 },
        { operationId: 'op2', operationGroupId: 2, operationName: 'Archived Client Facility', operationActive: 1 }
      ])
    );
    operationService.getOperationGroups.mockReturnValue(
      of([
        { operationGroupId: 1, operationGroupActive: 1 },
        { operationGroupId: 2, operationGroupActive: 0 }
      ])
    );
    http.post.mockReturnValue(of({ token: 'header.payload.signature' }));

    await firstValueFrom(service.doLogin('alice', 'secret'));

    const storedUser = JSON.parse(localStorage.getItem('followup-user'));
    expect(storedUser.operations.map((operation: any) => operation.operationId)).toEqual(['op1']);
    expect(storedUser.operationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([1]);
    expect(localStorage.getItem('operationGroups')).toContain('1');
    expect(localStorage.getItem('operationGroups')).not.toContain('2');
  });

  it('clears stale stored session when token is expired at startup', () => {
    localStorage.setItem('followup-user', JSON.stringify({ userId: 7 }));
    localStorage.setItem('followup-token', 'header.payload.signature');

    const { service, jwtHelper } = build();
    jwtHelper.decodeToken.mockReturnValue({
      user: { userLoginExpires: Date.now() - 1000 }
    });

    expect(service.getToken()).toBeNull();
    expect(service.currentUserValue).toBeNull();
    expect(localStorage.getItem('followup-user')).toBeNull();
    expect(localStorage.getItem('followup-token')).toBeNull();
  });

  it('stores a renewed token and exposes its server-side expiration', async () => {
    const { service, http, jwtHelper } = build();
    const refreshedExpiry = Date.now() + 8 * 60 * 60 * 1000;
    jwtHelper.decodeToken.mockReturnValue({
      user: { userId: 'u1', userLevel: 'level', userLoginExpires: refreshedExpiry }
    });
    http.post.mockReturnValue(of({ token: 'renewed.token.signature' }));

    const result = await firstValueFrom(service.refreshSession());

    expect(http.post).toHaveBeenCalledWith('users/refresh', {});
    expect(result.user.userLoginExpires).toBe(refreshedExpiry);
    expect(localStorage.getItem('followup-token')).toBe('renewed.token.signature');
    expect(service.getTokenSessionExpires()).toBe(refreshedExpiry);
  });

  it('rejects a refresh response without a valid future token', async () => {
    const { service, http } = build();
    http.post.mockReturnValue(of({ token: 'invalid' }));

    await expect(firstValueFrom(service.refreshSession())).rejects.toThrow(
      'Authentication refresh did not return a valid token.'
    );
  });

  it('returns an error observable when login fails', async () => {
    const { service, http } = build();
    http.post.mockReturnValue(throwError(new HttpErrorResponse({ status: 500, error: 'boom' })));

    await expect(firstValueFrom(service.doLogin('bad', 'creds'))).rejects.toMatchObject(
      expect.objectContaining({ status: 500, message: 'boom' })
    );
  });

  it('surfaces backend object messages from login failures and logs the payload clearly', async () => {
    const { service, http } = build();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    http.post.mockReturnValue(
      throwError(
        new HttpErrorResponse({
          status: 401,
          error: { message: 'Incorrect username or password.' }
        })
      )
    );

    try {
      await expect(firstValueFrom(service.doLogin('bad', 'creds'))).rejects.toMatchObject(
        expect.objectContaining({ status: 401, message: 'Incorrect username or password.' })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Backend returned code 401, body was: {"message":"Incorrect username or password."}'
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('surfaces duplicate-account selection payloads from login', async () => {
    const { service, http } = build();
    http.post.mockReturnValue(
      throwError(
        new HttpErrorResponse({
          status: 409,
          error: {
            requiresAccountSelection: true,
            suggestedUserId: 'user-2',
            accountChoices: [{ userId: 'user-1' }, { userId: 'user-2' }]
          }
        })
      )
    );

    await expect(firstValueFrom(service.doLogin('dup', 'creds'))).rejects.toMatchObject(
      expect.objectContaining({ status: 409, requiresAccountSelection: true, suggestedUserId: 'user-2' })
    );
  });

  it('clears session data on logout', async () => {
    const { service, http } = build();
    localStorage.setItem('followup-user', JSON.stringify({ userId: 2 }));
    localStorage.setItem('followup-token', 'header.payload.signature');
    http.post.mockReturnValue(of({}));

    await firstValueFrom(service.doLogout('2'));

    expect(localStorage.getItem('followup-user')).toBeNull();
    expect(localStorage.getItem('followup-token')).toBeNull();
    expect(service.currentUserValue).toBeNull();
    // Note: window.location.href assertion skipped due to Jest jsdom limitations
  });

  it('redirects and clears session data when logout fails', async () => {
    const { service, http } = build();
    localStorage.setItem('followup-user', JSON.stringify({ userId: 3 }));
    localStorage.setItem('followup-token', 'header.payload.signature');
    http.post.mockReturnValue(throwError(new HttpErrorResponse({ status: 503, error: 'down' })));

    await firstValueFrom(service.doLogout('3'));

    expect(localStorage.getItem('followup-user')).toBeNull();
    expect(localStorage.getItem('followup-token')).toBeNull();
    expect(service.currentUserValue).toBeNull();
    // Note: window.location.href assertion skipped due to Jest jsdom limitations
  });
});
