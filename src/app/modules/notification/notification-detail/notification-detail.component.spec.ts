import { of, Subject } from 'rxjs';
import { NotificationDetailComponent } from './notification-detail.component';
import { NotificationReplyModalComponent } from '../notification-reply-modal/notification-reply-modal.component';

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
    const modal = {
      present: jest.fn(() => Promise.resolve()),
      onDidDismiss: jest.fn(() => Promise.resolve({ data: { submitted: true } }))
    } as any;
    const modalController = {
      create: jest.fn(() => Promise.resolve(modal))
    } as any;

    const comp = new NotificationDetailComponent(
      route,
      patientService,
      notificationService,
      sharedFunctions,
      fb,
      toastr,
      authService,
      modalController
    );

    return { comp, patientService, notificationService, sharedFunctions, toastr, modalController, modal };
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

  it('ignores repeated reply submissions while the first request is pending', () => {
    const { comp, notificationService } = buildComponent();
    const pendingReply = new Subject<any>();
    notificationService.addNotificationReply.mockReturnValueOnce(pendingReply);
    comp.ngOnInit();

    comp.submitReply();
    comp.submitReply();

    expect(notificationService.addNotificationReply).toHaveBeenCalledTimes(1);
    expect(comp.isSubmittingReply).toBe(true);
    pendingReply.next({});
    pendingReply.complete();
    expect(comp.isSubmittingReply).toBe(false);
  });

  it('opens the reply modal with ModalController and refreshes replies after modal submission', async () => {
    const { comp, notificationService, toastr, modalController, modal } = buildComponent();

    comp.ngOnInit();

    expect(comp.currentUserId).toBe('u1');
    expect(comp.replyOperation).toEqual({ operationId: 'op1', operationGroupName: 'Main Operation' });

    await comp.openReplyModal();
    await Promise.resolve();

    expect(modalController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        component: NotificationReplyModalComponent,
        cssClass: ['followup-modal', 'notification-reply-modal'],
        componentProps: expect.objectContaining({
          notification: comp.notification,
          patient: comp.patient,
          operation: { operationId: 'op1', operationGroupName: 'Main Operation' },
          currentUserId: 'u1'
        })
      })
    );
    expect(modal.present).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalledWith('Reply submitted successfully');
    expect(notificationService.getNotificationRepliesByNotificationId).toHaveBeenCalledTimes(2);
  });
});
