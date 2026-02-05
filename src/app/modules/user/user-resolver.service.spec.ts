import { of } from 'rxjs';
import { UserResolver } from './user-resolver.service';

describe('UserResolver (Jest)', () => {
  const originalLocation = window.location;
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' }
    });
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  it('redirects to login when no current user', () => {
    const authService = { currentUserValue: null } as any;
    const resolver = new UserResolver(authService as any, {} as any);

    resolver.resolve();

    expect(window.location.href).toBe('/login');
  });

  it('signs out when session expired', () => {
    const user = { userId: 'u1', userLoginExpires: Date.now() - 1000 } as any;
    const authService = {
      currentUserValue: user,
      currentUserSubject: { getValue: () => user },
      signOut: jest.fn()
    } as any;
    const resolver = new UserResolver(authService as any, {} as any);

    const result = resolver.resolve();

    expect(authService.signOut).toHaveBeenCalledWith('u1');
    expect(result).toBeUndefined();
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
