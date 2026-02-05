import { Route } from '@angular/router';

import { Shell } from './shell.service';
import { ShellComponent } from './shell.component';
import { UserResolver } from '@app/modules/user/user-resolver.service';

describe('Shell helper (Jest)', () => {
  it('wraps child routes with shell defaults', () => {
    const childRoutes = [{ path: 'home' } as Route];

    const route = Shell.childRoutes(childRoutes);

    expect(route.path).toBe('');
    expect(route.component).toBe(ShellComponent);
    expect(route.children).toBe(childRoutes);
    expect(route.data?.reuse).toBe(false);
    expect(route.resolve?.user).toBe(UserResolver);
  });
});
