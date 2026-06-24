import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthGuardService } from './auth-guard.service';
import { AuthenticationService } from './auth.service';

describe('AuthGuardService (Jest)', () => {
  const routerStub = ({ navigate: jest.fn() } as unknown) as Router;

  const buildGuard = (currentUserValue: any) => {
    const authStub = { currentUserValue } as AuthenticationService;
    return new AuthGuardService(authStub as any, routerStub);
  };

  beforeEach(() => {
    (routerStub.navigate as jest.Mock).mockClear();
  });

  it('allows activation for authenticated users with matching roles', () => {
    const guard = buildGuard({ userLevel: 'admin' } as any);
    const route = ({ data: { roles: ['admin'] } } as unknown) as ActivatedRouteSnapshot;
    const state = ({ url: '/home' } as unknown) as RouterStateSnapshot;

    expect(guard.canActivate(route, state)).toBe(true);
    expect(routerStub.navigate).not.toHaveBeenCalled();
  });

  it('blocks navigation and redirects when role is not permitted', () => {
    const guard = buildGuard({ userLevel: 'viewer' } as any);
    const route = ({ data: { roles: ['admin'] } } as unknown) as ActivatedRouteSnapshot;
    const state = ({ url: '/admin' } as unknown) as RouterStateSnapshot;

    expect(guard.canActivate(route, state)).toBe(false);
    expect(routerStub.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('redirects to login with the requested route when no authenticated user is present', () => {
    const guard = buildGuard(null);
    const route = ({ data: {} } as unknown) as ActivatedRouteSnapshot;
    const state = ({ url: '/patients/123' } as unknown) as RouterStateSnapshot;

    expect(guard.canActivate(route, state)).toBe(false);
    expect(routerStub.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/patients/123'
      }
    });
  });
});
