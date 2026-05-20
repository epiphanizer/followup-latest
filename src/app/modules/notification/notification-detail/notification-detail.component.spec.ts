import { of } from 'rxjs';
import { NotificationDetailComponent } from './notification-detail.component';

describe('NotificationDetailComponent (Jest)', () => {
  it('loads notification and patient details', () => {
    const route = {
      snapshot: {
        data: {
          notification: {
            notificationId: 'n1',
            notificationOperationId: 'op1',
            notificationPatientId: 'p1',
            notificationMessage: '<p>hi</p>'
          },
          user: { userId: 'u1' }
        }
      }
    } as any;
    const patientService = {
      getPatientByPatientId: jest.fn(() => of([{ patientId: 'p1', patientOperationName: 'Main Operation' }] as any))
    } as any;
    const sharedFunctions = { returnHTML: jest.fn(msg => msg) } as any;
    const comp = new NotificationDetailComponent(route, patientService, sharedFunctions);

    comp.ngOnInit();

    expect(sharedFunctions.returnHTML).toHaveBeenCalled();
    expect(patientService.getPatientByPatientId).toHaveBeenCalledWith('p1');
    expect(comp.patient.patientId).toBe('p1');
    expect(comp.currentUserId).toBe('u1');
    expect(comp.notification.notificationMessage).toBe('<p>hi</p>');
    expect(comp.replyOperation).toEqual({ operationId: 'op1', operationGroupName: 'Main Operation' });
  });

  it('opens and closes the reply modal when reply context exists', () => {
    const route = {
      snapshot: {
        data: {
          notification: {
            notificationId: 'n1',
            notificationOperationId: 'op1',
            notificationPatientId: 'p1',
            notificationMessage: '<p>hi</p>'
          },
          user: { userId: 'u1' }
        }
      }
    } as any;
    const patientService = {
      getPatientByPatientId: jest.fn(() => of([{ patientId: 'p1', patientOperationName: 'Main Operation' }] as any))
    } as any;
    const sharedFunctions = { returnHTML: jest.fn(msg => msg) } as any;
    const comp = new NotificationDetailComponent(route, patientService, sharedFunctions);

    comp.ngOnInit();
    comp.openReplyModal();

    expect(comp.isReplyModalOpen).toBe(true);

    comp.onReplySubmitted();
    expect(comp.isReplyModalOpen).toBe(false);

    comp.openReplyModal();
    comp.closeReplyModal();
    expect(comp.isReplyModalOpen).toBe(false);
  });
});
