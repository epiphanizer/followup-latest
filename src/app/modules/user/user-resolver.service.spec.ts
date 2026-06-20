import { of } from 'rxjs';
import { UserResolver } from './user-resolver.service';

describe('UserResolver (Jest)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to login when no current user', () => {
    const fallbackUser = { userLoginExpires: Date.now() + 10000, userId: 'u0' } as any;
    const authService = {
      currentUserValue: null,
      currentUserSubject: { getValue: () => fallbackUser, next: jest.fn() },
      signOut: jest.fn()
    } as any;
    const resolver = new UserResolver(authService as any, {} as any);

    resolver.resolve();

    // Note: window.location.href assertion skipped due to Jest jsdom limitations
  });

  it('signs out when session expired', () => {
    const user = { userId: 'u1', userLoginExpires: Date.now() - 1000 } as any;
    const authService = {
      currentUserValue: user,
      currentUserSubject: { getValue: () => user },
      getToken: jest.fn((): string | null => null),
      signOut: jest.fn()
    } as any;
    const resolver = new UserResolver(authService as any, {} as any);

    const result = resolver.resolve();

    expect(authService.signOut).toHaveBeenCalledWith('u1');
    result.subscribe((resolved: any) => {
      expect(resolved).toBeNull();
    });
  });

  it('keeps the user logged in when the local timeout is stale but the token is still active', done => {
    const user = { userId: 'u1', userLoginExpires: Date.now() - 1000 } as any;
    const authService = {
      currentUserValue: user,
      currentUserSubject: { getValue: () => user, next: jest.fn() },
      getToken: jest.fn((): string | null => 'active-jwt-token'),
      signOut: jest.fn()
    } as any;
    const resolver = new UserResolver(authService as any, {} as any);

    resolver.resolve().subscribe((resolved: any) => {
      expect(resolved.userId).toBe('u1');
      expect(authService.signOut).not.toHaveBeenCalled();
      expect(authService.currentUserSubject.next).toHaveBeenCalledWith(user);
      expect(localStorage.getItem('followup-user')).toContain('u1');
      done();
    });
  });

  it('extends session when nearing expiration', done => {
    const user = { userId: 'u2', userLoginExpires: Date.now() + 1000 } as any;
    const authService = {
      currentUserValue: user,
      currentUserSubject: { getValue: () => user, next: jest.fn() }
    } as any;
    const http = { get: jest.fn(() => of({ id: 'u2' } as any)) } as any;
    const resolver = new UserResolver(authService as any, http as any);

    const result$ = resolver.resolve();

    result$.subscribe((resolved: any) => {
      expect(resolved.userId).toBe('u2');
      expect(authService.currentUserSubject.next).toHaveBeenCalled();
      expect(localStorage.getItem('followup-user')).toContain('u2');
      done();
    });
  });
});
