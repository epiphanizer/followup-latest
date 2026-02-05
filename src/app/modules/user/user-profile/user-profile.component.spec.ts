import { BehaviorSubject, of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { SuperForm } from 'angular-super-validator';

import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent (Jest)', () => {
  const baseUser: any = {
    userId: 'u1',
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

  const makeComponent = () => {
    const authenticationService = { currentUserSubject: new BehaviorSubject(baseUser) } as any;
    const operationService = {} as any;
    const toastrService = { success: jest.fn(() => ({ onShown: { pipe: () => ({ subscribe: jest.fn() }) } })) } as any;
    const userService = { updateUserByUserId: jest.fn(() => of({})) } as any;

    const comp = new UserProfileComponent(
      authenticationService,
      operationService,
      new FormBuilder(),
      toastrService,
      userService
    );

    return { comp, authenticationService, userService };
  };

  it('builds the profile form from the current user', () => {
    const { comp } = makeComponent();

    comp.ngOnInit();

    expect(comp.userProfileForm).toBeTruthy();
    expect(comp.userProfileForm.get('userFirstName')?.value).toBe('Ada');
    expect(comp.userProfileForm.get('userSpeaksSpanish')?.value).toBe('0');
  });

  it('returns payload with sensible defaults', () => {
    const { comp } = makeComponent();
    comp.user = baseUser;
    comp.ngOnInit();

    const payload = comp.userFormSubmissionFactory(comp.userProfileForm.getRawValue());

    expect(payload.userFirstName).toBe('Ada');
    expect(payload.userInterests).toContain('celebrity');
  });

  it('validates controls and triggers save when valid', () => {
    const { comp, userService } = makeComponent();
    comp.user = baseUser;
    comp.ngOnInit();
    jest.spyOn(comp as any, 'validateControls').mockReturnValue(true as any);

    comp.updateUserProfile();

    expect(userService.updateUserByUserId).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  it('reports validation errors when form is invalid', () => {
    const { comp } = makeComponent();
    comp.user = baseUser;
    comp.ngOnInit();
    document.body.innerHTML = '<div class="ng-invalid"></div>';
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // @ts-ignore
    SuperForm.getAllErrors = jest.fn(() => ({ field: true }));
    // @ts-ignore
    SuperForm.getAllErrorsFlat = jest.fn(() => ({ field: true }));

    const valid = comp.validateControls();

    expect(valid).toBe(false);
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
