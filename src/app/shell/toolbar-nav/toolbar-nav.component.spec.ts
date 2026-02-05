import { of } from 'rxjs';
import { ActivationEnd } from '@angular/router';
import * as FileSaver from 'file-saver';

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

  beforeEach(() => {
    component = new ToolbarNavComponent(modalCtrlMock as any, routeMock as any, routerMock as any, dataServiceMock);
    component.callQueuePage = true;
    component.createNotification = jest.fn();
    (FileSaver as any).saveAs = jest.fn();
    component.ngOnInit();
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

  it('invokes dynamic actions', done => {
    component.dynamicLink({ linkAction: 'createNotification' } as any);
    expect(component.createNotification).toHaveBeenCalled();

    component.dynamicLink({ linkAction: 'getExcelReport' } as any);
    expect(dataServiceMock.getData).toHaveBeenCalled();
    setTimeout(() => {
      expect((FileSaver as any).saveAs).toHaveBeenCalled();
      done();
    }, 0);
  });
});
