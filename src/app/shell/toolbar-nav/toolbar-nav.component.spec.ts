import { HttpHeaders, HttpResponse } from '@angular/common/http';
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

import { BehaviorSubject, of } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import * as FileSaver from 'file-saver';
import { UserRoles } from '@app/modules/user/user';

import { ToolbarNavComponent } from './toolbar-nav.component';

describe('ToolbarNavComponent logic', () => {
  let component: ToolbarNavComponent;
  const modalCtrlMock: any = { create: jest.fn(() => Promise.resolve({ present: jest.fn() })) };
  const notificationServiceMock: any = { getNotificationTypes: jest.fn(() => of([])) };
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
  const routerMock: any = { events: of(new NavigationEnd(1, '/home', '/home')), navigate: jest.fn() };
  const dataServiceMock: any = {
    getData: jest.fn(() =>
      of(
        new HttpResponse({
          body: new Blob(['x'], { type: 'text/plain' }),
          headers: new HttpHeaders({ 'content-disposition': 'attachment; filename="data-alpha.xlsx"' })
        })
      )
    )
  };
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
      authServiceMock,
      notificationServiceMock
    );
    component.callQueuePage = true;
    component.createNotification = jest.fn();
    ((FileSaver.saveAs as unknown) as jest.Mock).mockClear();
    component.ngOnInit();
  });

  afterEach(() => {
    notificationServiceMock.getNotificationTypes.mockClear();
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
    expect(component.navLinks.some(link => link.linkName === 'Clients')).toBe(true);
    const clientsNavLink = component.navLinks.find(link => link.linkName === 'Clients');
    expect(clientsNavLink?.dropdown?.links?.some((link: any) => link.linkName === 'Operations')).toBe(true);
    expect(component.navLinks[0].dropdown.links.some((link: any) => link.linkName === 'Version Change Log')).toBe(
      false
    );
    const patientPortal = component.navLinks.find(link => link.linkName === 'Patient Portal');
    const addPatientLink = patientPortal?.dropdown?.links?.find((link: any) => link.linkName === 'Add Patient');
    expect(addPatientLink?.minRole).toBe(2);
  });

  it('keeps Add Patient manager-plus in the toolbar dropdown', () => {
    const patientPortal = component.navLinks.find(link => link.linkName === 'Patient Portal');
    const addPatientLink = patientPortal?.dropdown?.links?.find((link: any) => link.linkName === 'Add Patient');

    authUserSubject.next({ userId: 'manager-1', userLevel: UserRoles.manager });
    expect(component.canAccessLink(addPatientLink)).toBe(true);

    authUserSubject.next({ userId: 'user-1', userLevel: UserRoles.user });
    expect(component.canAccessLink(addPatientLink)).toBe(false);
  });

  it('marks User Management as manager-visible while keeping admin-only child links stricter', () => {
    const managementNavLink = component.navLinks.find(link => link.linkName === 'Admin') as any;

    expect(managementNavLink.minRole).toBe(2);
    expect(managementNavLink.dropdown.links.find((link: any) => link.linkName === 'User Management').minRole).toBe(2);
    expect(managementNavLink.dropdown.links.find((link: any) => link.linkName === 'Team Management').minRole).toBe(1);
  });

  it('keeps Admin as the parent menu label while retaining Team Management as a child link', () => {
    const managementNavLink = component.navLinks.find(link => link.linkName === 'Admin') as any;

    expect(managementNavLink).toBeTruthy();
    expect(managementNavLink.dropdown.links.find((link: any) => link.linkName === 'Team Management')).toBeTruthy();
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
    expect(FileSaver.saveAs).toHaveBeenCalledWith(expect.any(Blob), 'data-alpha.xlsx');
  });

  it('falls back to data-alpha.xlsx outside production when the API omits a filename', () => {
    dataServiceMock.getData.mockReturnValueOnce(
      of(
        new HttpResponse({
          body: new Blob(['x'], { type: 'text/plain' }),
          headers: new HttpHeaders()
        })
      )
    );

    component.dynamicLink({ linkAction: 'getExcelReport' } as any);

    expect(FileSaver.saveAs).toHaveBeenCalledWith(expect.any(Blob), 'data-alpha.xlsx');
  });

  it('preloads notification types when opening the notify modal', async () => {
    await component.createNotificationModal();

    expect(notificationServiceMock.getNotificationTypes).toHaveBeenCalled();
    expect(modalCtrlMock.create).toHaveBeenCalled();
  });

  it('emits a service health request from the admin menu action', () => {
    const emitSpy = jest.spyOn(component.serviceHealthRequested, 'emit');

    component.dynamicLink({ linkAction: 'toggleServiceHealth' } as any);

    expect(emitSpy).toHaveBeenCalledWith('panel');
    expect(component.dropdownActivated).toBe(false);
  });
});
