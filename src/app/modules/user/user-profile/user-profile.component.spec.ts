import { BehaviorSubject, of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
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
});
