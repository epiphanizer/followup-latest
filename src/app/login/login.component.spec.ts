import { FormBuilder } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent (Jest)', () => {
  const platform = { is: jest.fn().mockReturnValue(false) } as any;
  const router = { navigate: jest.fn() } as any;
  const toastrService = { error: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates form and signs in with provided credentials', async () => {
    const authenticationService = {
      currentUserValue: null,
      signIn: jest.fn(async () => true)
    } as any;
    const comp = new LoginComponent(new FormBuilder(), platform, authenticationService, router, toastrService);

    comp.loginForm.setValue({ username: 'user', password: 'pass' });
    await comp.signIn();

    expect(authenticationService.signIn).toHaveBeenCalledWith('user', 'pass', undefined);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('shows account choices when login requires account selection', async () => {
    const authenticationService = {
      currentUserValue: null,
      signIn: jest.fn(async (_username: string, _password: string, selectedUserId?: string) => {
        if (!selectedUserId) {
          throw {
            status: 409,
            requiresAccountSelection: true,
            suggestedUserId: 'user-2',
            selectionReason: 'Suggested because it is the most recent active matching account.',
            accountChoices: [
              { userId: 'user-1', username: 'asmith', userFirstName: 'Anna', userLastName: 'Smith' },
              { userId: 'user-2', username: 'asmith', userFirstName: 'Anna', userLastName: 'Smith Two' }
            ]
          };
        }

        return true;
      })
    } as any;
    const comp = new LoginComponent(new FormBuilder(), platform, authenticationService, router, toastrService);

    comp.loginForm.setValue({ username: 'user', password: 'pass' });
    await comp.signIn();

    expect(comp.accountSelection?.accountChoices.length).toBe(2);
    expect(comp.selectedAccountUserId).toBe('user-2');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('retries login with the selected account', async () => {
    const authenticationService = {
      currentUserValue: null,
      signIn: jest.fn(async () => true)
    } as any;
    const comp = new LoginComponent(new FormBuilder(), platform, authenticationService, router, toastrService);

    comp.loginForm.setValue({ username: 'user', password: 'pass' });
    (comp as any).pendingUsername = 'user';
    (comp as any).pendingPassword = 'pass';
    comp.selectedAccountUserId = 'user-2';

    await comp.signInWithSelectedAccount();

    expect(authenticationService.signIn).toHaveBeenCalledWith('user', 'pass', 'user-2');
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
