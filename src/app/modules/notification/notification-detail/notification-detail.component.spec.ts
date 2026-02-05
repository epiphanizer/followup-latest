import { of } from 'rxjs';
import { NotificationDetailComponent } from './notification-detail.component';

describe('NotificationDetailComponent (Jest)', () => {
  it('loads notification and patient details', () => {
    const route = {
      snapshot: {
        data: {
          notification: { notificationPatientId: 'p1', notificationMessage: '<p>hi</p>' }
        }
      }
    } as any;
    const patientService = {
      getPatientByPatientId: jest.fn(() => of([{ patientId: 'p1' }] as any))
    } as any;
    const sharedFunctions = { returnHTML: jest.fn(msg => msg) } as any;
    const comp = new NotificationDetailComponent(route, patientService, sharedFunctions);

    comp.ngOnInit();

    expect(sharedFunctions.returnHTML).toHaveBeenCalled();
    expect(patientService.getPatientByPatientId).toHaveBeenCalledWith('p1');
    expect(comp.patient.patientId).toBe('p1');
    expect(comp.notification.notificationMessage).toBe('<p>hi</p>');
  });
});
