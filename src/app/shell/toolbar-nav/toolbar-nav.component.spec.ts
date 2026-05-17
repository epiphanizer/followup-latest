jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

import { BehaviorSubject, of } from 'rxjs';
import { ActivationEnd } from '@angular/router';
import * as FileSaver from 'file-saver';
import { UserRoles } from '@app/modules/user/user';

import { ToolbarNavComponent } from './toolbar-nav.component';

describe('ToolbarNavComponent logic', () => {
  let component: ToolbarNavComponent;
  const modalCtrlMock: any = { create: jest.fn(() => Promise.resolve({ present: jest.fn() })) };
  const routeMock: any = {
    snapshot: {
      data: { user: { userId: 'u1' }, patient: null },
      children: [
        {
          data: {
            patient: {
              patientId: 'p1',
              patientOperationId: 'op1',
              patientFirstName: 'Pat',
              patientLastName: 'Smith',
              patientMedicalRecordNumber: '123',
              patientOperationName: 'Op'
            }
          }
        }
      ]
    }
  };
  const routerMock: any = { events: of(new ActivationEnd({} as any, {} as any, 'root')), navigate: jest.fn() };
  const dataServiceMock: any = { getData: jest.fn(() => of(new Blob(['x'], { type: 'text/plain' }))) };
  const authUserSubject = new BehaviorSubject<any>({ userId: 'u1', userLevel: UserRoles.admin });
  const authServiceMock: any = {
    currentUserSubject: authUserSubject,
    currentUser: authUserSubject.asObservable(),
    get currentUserValue() {
      return authUserSubject.getValue();
    }
  };

  beforeEach(() => {
    component = new ToolbarNavComponent(
      modalCtrlMock as any,
      routeMock as any,
      routerMock as any,
      dataServiceMock,
      authServiceMock
    );
    component.callQueuePage = true;
    component.createNotification = jest.fn();
    (FileSaver.saveAs as jest.Mock).mockClear();
    component.ngOnInit();
  });

  it('updates the user from auth service changes', () => {
    expect(component.user.userLevel).toBe(UserRoles.admin);

    authUserSubject.next({ userId: 'u2', userLevel: UserRoles.user });

    expect(component.user.userId).toBe('u2');
    expect(component.user.userLevel).toBe(UserRoles.user);
  });

  it('normalizes numeric user roles', () => {
    authUserSubject.next({ userId: 'u3', userLevel: 2 });

    expect(component.getUserRoleValue(component.user)).toBe(2);
  });

  it('initializes nav links and dropdowns', () => {
    expect(component.navLinks.length).toBeGreaterThan(0);
    expect(component.dropdowns.length).toBeGreaterThan(0);
  });

  it('opens and closes dropdowns', () => {
    component.openDropdown(0);
    expect(component.dropdowns[0].activated).toBe(true);
    expect(component.dropdownActivated).toBe(true);

    component.closeDropdown(0);
    expect(component.dropdowns[0].activated).toBe(false);
    component.closeDropdowns();
    expect(component.dropdownActivated).toBe(false);
  });

  it('invokes dynamic actions', () => {
    component.callQueuePage = true;
    component.dynamicLink({ linkAction: 'createNotification' } as any);
    expect(component.createNotification).toHaveBeenCalled();

    component.dynamicLink({ linkAction: 'getExcelReport' } as any);
    expect(dataServiceMock.getData).toHaveBeenCalled();
    expect(FileSaver.saveAs).toHaveBeenCalled();
  });

  it('emits a service health request from the admin menu action', () => {
    const emitSpy = jest.spyOn(component.serviceHealthRequested, 'emit');

    component.dynamicLink({ linkAction: 'toggleServiceHealth' } as any);

    expect(emitSpy).toHaveBeenCalled();
    expect(component.dropdownActivated).toBe(false);
  });
});
