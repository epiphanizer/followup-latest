import { BehaviorSubject, of, throwError } from 'rxjs';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent (Jest)', () => {
  const baseUser: any = {
    userId: 'u1',
    userLevel: '2PEXyKgz',
    userFirstName: 'Ada',
    userLastName: 'Lovelace',
    userEmail: 'ada@example.com',
    userCountryCode: '1',
    userAreaCode: '415',
    userPhoneNumber: '5551212',
    userDob: '2000-01-01',
    userFavoriteDessert: 'Cake',
    userSpeaksSpanish: false,
    userInterests: {}
  };

  const makeComponent = (options?: { routeUserId?: string; loadedUser?: any }) => {
    const authenticationService = {
      currentUserSubject: new BehaviorSubject(baseUser),
      startImpersonation: jest.fn(() => Promise.resolve(options?.loadedUser || { ...baseUser, userId: 'u2' }))
    } as any;
    const route = {
      snapshot: {
        data: { user: baseUser },
        paramMap: {
          get: jest.fn((key: string) => (key === 'userId' ? options?.routeUserId || null : null))
        }
      }
    } as any;
    const router = { navigate: jest.fn() } as any;
    const toastrService = {
      success: jest.fn(() => ({ onShown: { pipe: () => ({ subscribe: jest.fn() }) } })),
      error: jest.fn()
    } as any;
    const userService = {
      updateUserByUserId: jest.fn(() => of({})),
      getUserByUserId: jest.fn(() => of(options?.loadedUser || { ...baseUser, userId: 'u2', userFirstName: 'Grace' })),
      impersonateUser: jest.fn(() => of(options?.loadedUser || { ...baseUser, userId: 'u2', userFirstName: 'Grace' }))
    } as any;

    const comp = new UserProfileComponent(
      authenticationService,
      route,
      router,
      new FormBuilder(),
      toastrService,
      userService
    );

    return { comp, authenticationService, route, router, toastrService, userService };
  };

  it('builds the profile form from the current user', () => {
    const { comp } = makeComponent();

    comp.ngOnInit();

    expect(comp.userProfileForm).toBeTruthy();
    expect(comp.userProfileForm.get('userFirstName')?.value).toBe('Ada');
    expect(comp.userProfileForm.get('userSpeaksSpanish')?.value).toBe('0');
    expect(comp.userProfileForm.get('userDob')?.value).toBe('01/01/2000');
  });

  it('loads the targeted user when opened from the admin user route', () => {
    const { comp, userService } = makeComponent({
      routeUserId: 'u2',
      loadedUser: { ...baseUser, userId: 'u2', userFirstName: 'Grace', userLastName: 'Hopper' }
    });

    comp.ngOnInit();

    expect(userService.getUserByUserId).toHaveBeenCalledWith('u2');
    expect(comp.user.userId).toBe('u2');
    expect(comp.pageTitle).toBe('Edit User');
  });

  it('allows managers to load another user from the edit route', () => {
    const { comp, userService, authenticationService } = makeComponent({
      routeUserId: 'u2',
      loadedUser: { ...baseUser, userId: 'u2', userFirstName: 'Grace', userLastName: 'Hopper' }
    });

    const managerUser = { ...baseUser, userLevel: 'xmKxrNOy' } as any;
    authenticationService.currentUserSubject.next(managerUser);

    comp.ngOnInit();

    expect(userService.getUserByUserId).toHaveBeenCalledWith('u2');
    expect(comp.user.userId).toBe('u2');
  });

  it('allows admins to login as the viewed user from admin edit mode', async () => {
    const loadedUser = { ...baseUser, userId: 'u2', userFirstName: 'Grace', userLastName: 'Hopper' };
    const { comp, userService, authenticationService, router } = makeComponent({
      routeUserId: 'u2',
      loadedUser
    });

    comp.ngOnInit();
    comp.loginAsUser();

    expect(userService.impersonateUser).toHaveBeenCalledWith('u1', 'u2');
    expect(authenticationService.startImpersonation).toHaveBeenCalledWith(loadedUser, baseUser);

    await Promise.resolve();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('does not expose login as user for the current self profile', () => {
    const { comp } = makeComponent({ routeUserId: 'u1', loadedUser: { ...baseUser } });

    comp.ngOnInit();

    expect(comp.canLoginAsUser).toBe(false);
  });

  it('falls back to default interests when admin edit loads malformed legacy profile data', () => {
    const { comp } = makeComponent({
      routeUserId: 'u2',
      loadedUser: {
        ...baseUser,
        userId: 'u2',
        userFirstName: 'Grace',
        userInterests: '',
        userDob: 'not-a-date'
      }
    });

    comp.ngOnInit();

    expect(comp.userProfileForm).toBeTruthy();
    expect(comp.userProfileForm.get('userDob')?.value).toBe('');
    expect(comp.user.userInterests.celebrity).toBe(false);
    expect(comp.user.userInterests.DND).toBe(false);
  });

  it('returns payload with sensible defaults', () => {
    const { comp } = makeComponent();
    comp.user = baseUser;
    comp.ngOnInit();

    const payload = comp.userFormSubmissionFactory(comp.userProfileForm.getRawValue());

    expect(payload.userFirstName).toBe('Ada');
    expect(payload.userPhoneNumber).toBe('555-1212');
    expect(payload.userDob).toBe('2000-01-01');
    expect(payload.userInterests).toContain('celebrity');
  });

  it('rejects incomplete, impossible, and future birthdays', () => {
    const { comp } = makeComponent();
    comp.ngOnInit();
    const dobControl = comp.userProfileForm.get('userDob');

    dobControl?.setValue('01/01/20');
    expect(dobControl?.hasError('invalidDate')).toBe(true);

    dobControl?.setValue('02/31/2020');
    expect(dobControl?.hasError('invalidDate')).toBe(true);

    dobControl?.setValue('12/31/2999');
    expect(dobControl?.hasError('futureDate')).toBe(true);

    dobControl?.setValue('02/29/2024');
    expect(dobControl?.valid).toBe(true);
  });

  it('validates controls and triggers save when valid', () => {
    const { comp, userService } = makeComponent();
    comp.user = baseUser;
    comp.ngOnInit();
    jest.spyOn(comp as any, 'validateControls').mockReturnValue(true as any);

    comp.updateUserProfile();

    expect(userService.updateUserByUserId).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  it('navigates back to the roster when canceling admin edit mode', () => {
    const { comp, router } = makeComponent({ routeUserId: 'u2' });

    comp.ngOnInit();
    comp.cancelUpdateProfile();

    expect(router.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('reports validation errors when form is invalid', () => {
    const { comp } = makeComponent();
    comp.user = baseUser;
    comp.ngOnInit();
    comp.userProfileForm.setControl('userFirstName', new FormControl('', Validators.required));
    document.body.innerHTML =
      '<ion-item><ion-label>First Name *</ion-label><ion-input formControlName="userFirstName"></ion-input></ion-item>';
    const item = document.querySelector('ion-item') as HTMLElement;
    const input = document.querySelector('ion-input') as any;
    item.scrollIntoView = jest.fn();
    input.setFocus = jest.fn(() => Promise.resolve());
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const valid = comp.validateControls();

    expect(valid).toBe(false);
    expect(item.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(input.setFocus).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Unable to save. Please check First Name.');
    alertSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('ignores unrelated ng-invalid DOM classes when the profile form is valid', () => {
    const { comp } = makeComponent();
    comp.ngOnInit();
    document.body.innerHTML = '<div class="ng-invalid"></div>';

    expect(comp.validateControls()).toBe(true);
    document.body.innerHTML = '';
  });

  it('keeps profile entries and allows retry after an update failure', () => {
    const { comp, router, toastrService, userService } = makeComponent();
    comp.ngOnInit();
    userService.updateUserByUserId.mockReturnValue(throwError(() => new Error('save failed')));
    const enteredName = comp.userProfileForm.get('userFirstName')!.value;

    comp.updateUserProfile();

    expect(comp.isSaving).toBe(false);
    expect(comp.userProfileForm.get('userFirstName')!.value).toBe(enteredName);
    expect(toastrService.error).toHaveBeenCalledWith(
      'Profile was not saved. Your entries are still here; please review them and try again.'
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
