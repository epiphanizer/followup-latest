import { FormBuilder } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent (Jest)', () => {
  const platform = { is: jest.fn().mockReturnValue(false) } as any;
  const router = { navigate: jest.fn() } as any;
  const toastrService = { error: jest.fn() } as any;

  it('creates form and signs in with provided credentials', async () => {
    const authenticationService = {
      currentUserValue: null,
      signIn: jest.fn(async () => true)
    } as any;
    const comp = new LoginComponent(new FormBuilder(), platform, authenticationService, router, toastrService);

    comp.loginForm.setValue({ username: 'user', password: 'pass' });
    await comp.signIn();

    expect(authenticationService.signIn).toHaveBeenCalledWith('user', 'pass');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('exposes web platform flag', () => {
    const comp = new LoginComponent(
      new FormBuilder(),
      platform,
      { currentUserValue: null } as any,
      router,
      toastrService
    );
    expect(comp.isWeb).toBe(true);
  });
});
