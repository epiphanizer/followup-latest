import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Location } from '@angular/common';

import { AuthGuardService } from './auth-guard.service';
import { AuthenticationService } from './auth.service';

describe('AuthGuardService (Jest)', () => {
  const routerStub = ({ navigate: jest.fn() } as unknown) as Router;
  const locationStub = ({ back: jest.fn() } as unknown) as Location;

  const buildGuard = (currentUserValue: any) => {
    const authStub = { currentUserValue } as AuthenticationService;
    return new AuthGuardService(authStub as any, locationStub, {} as ActivatedRoute, routerStub);
  };

  beforeEach(() => {
    (routerStub.navigate as jest.Mock).mockClear();
    (locationStub.back as jest.Mock).mockClear();
  });

  it('allows activation for authenticated users with matching roles', () => {
    const guard = buildGuard({ userLevel: 'admin' } as any);
    const route = ({ data: { roles: ['admin'] } } as unknown) as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(true);
    expect(routerStub.navigate).not.toHaveBeenCalled();
  });

  it('blocks navigation and redirects when role is not permitted', () => {
    const guard = buildGuard({ userLevel: 'viewer' } as any);
    const route = ({ data: { roles: ['admin'] } } as unknown) as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(routerStub.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('navigates back when no authenticated user is present', () => {
    const guard = buildGuard(null);
    const route = ({ data: {} } as unknown) as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBe(false);
    expect(locationStub.back).toHaveBeenCalled();
  });
});
