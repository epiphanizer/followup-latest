import { of } from 'rxjs';
import { NotificationDetailComponent } from './notification-detail.component';

describe('NotificationDetailComponent (Jest)', () => {
  const buildComponent = () => {
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
    const notificationService = {
      getNotificationRepliesByNotificationId: jest.fn(() => of([])),
      addNotificationReply: jest.fn(() => of({}))
    } as any;
    const sharedFunctions = { returnHTML: jest.fn(msg => msg) } as any;
    const fb = {
      group: jest.fn(() => ({
        invalid: false,
        reset: jest.fn(),
        get: jest.fn(() => ({ value: 'reply-text' }))
      }))
    } as any;
    const toastr = { success: jest.fn(), error: jest.fn() } as any;
    const authService = { currentUserValue: { userId: 'u1' } } as any;

    const comp = new NotificationDetailComponent(
      route,
      patientService,
      notificationService,
      sharedFunctions,
      fb,
      toastr,
      authService
    );

    return { comp, patientService, notificationService, sharedFunctions, toastr };
  };

  it('loads notification and patient details', () => {
    const { comp, patientService, notificationService, sharedFunctions } = buildComponent();

    comp.ngOnInit();

    expect(sharedFunctions.returnHTML).toHaveBeenCalled();
    expect(patientService.getPatientByPatientId).toHaveBeenCalledWith('p1');
    expect(notificationService.getNotificationRepliesByNotificationId).toHaveBeenCalledWith('n1');
    expect(comp.patient.patientId).toBe('p1');
    expect(comp.notification.notificationMessage).toBe('<p>hi</p>');
  });

  it('submits reply and refreshes replies', () => {
    const { comp, notificationService, toastr } = buildComponent();

    comp.ngOnInit();
    comp.submitReply();

    expect(notificationService.addNotificationReply).toHaveBeenCalledWith('n1', 'p1', 'op1', {
      userId: 'u1',
      replyText: 'reply-text'
    });
    expect(toastr.success).toHaveBeenCalled();
    expect(notificationService.getNotificationRepliesByNotificationId).toHaveBeenCalledTimes(2);
  });

  it('opens the reply modal and refreshes replies after modal submission', () => {
    const { comp, notificationService, toastr } = buildComponent();

    comp.ngOnInit();

    expect(comp.currentUserId).toBe('u1');
    expect(comp.replyOperation).toEqual({ operationId: 'op1', operationGroupName: 'Main Operation' });

    comp.openReplyModal();
    expect(comp.isReplyModalOpen).toBe(true);

    comp.onReplySubmitted();

    expect(comp.isReplyModalOpen).toBe(false);
    expect(toastr.success).toHaveBeenCalledWith('Reply submitted successfully');
    expect(notificationService.getNotificationRepliesByNotificationId).toHaveBeenCalledTimes(2);

    comp.closeReplyModal();
    expect(comp.isReplyModalOpen).toBe(false);
  });
});
