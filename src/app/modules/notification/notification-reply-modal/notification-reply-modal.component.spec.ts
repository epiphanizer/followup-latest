import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NotificationReplyModalComponent } from './notification-reply-modal.component';
import { NotificationService } from '../notification.service';
import { of, throwError } from 'rxjs';
import { ModalController } from '@ionic/angular';

describe('NotificationReplyModalComponent', () => {
  let component: NotificationReplyModalComponent;
  let fixture: ComponentFixture<NotificationReplyModalComponent>;
  let notificationService: {
    addNotificationReply: jest.Mock;
  };
  let modalController: {
    dismiss: jest.Mock;
  };

  beforeEach(async () => {
    const notificationServiceSpy = {
      addNotificationReply: jest.fn()
    };
    const modalControllerSpy = {
      dismiss: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [NotificationReplyModalComponent],
      imports: [FormsModule],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy }
      ]
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService) as any;
    modalController = TestBed.inject(ModalController) as any;
    fixture = TestBed.createComponent(NotificationReplyModalComponent);
    component = fixture.componentInstance;
    component.notification = { notificationId: 'n1', notificationTypeLabel: 'Test' };
    component.patient = { patientId: 'p1', patientFirstName: 'John', patientLastName: 'Doe' };
    component.operation = { operationId: 'op1', operationGroupName: 'Test Operation' };
    component.currentUserId = '1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate character count correctly', () => {
    component.replyText = 'Hello World';
    expect(component.characterCount).toBe(11);
  });

  it('should calculate remaining characters correctly', () => {
    component.replyText = 'Test';
    expect(component.remainingCharacters).toBe(component.maxCharacters - 4);
  });

  it('should validate form correctly', () => {
    component.replyText = '';
    expect(component.isValid).toBeFalsy();

    component.replyText = 'Valid reply';
    expect(component.isValid).toBeTruthy();

    component.replyText = 'a'.repeat(component.maxCharacters + 1);
    expect(component.isValid).toBeFalsy();
  });

  it('should submit reply successfully', () => {
    component.replyText = 'Test reply';
    const mockResponse = { notificationReplyId: 'abc123' };
    notificationService.addNotificationReply.mockReturnValue(of(mockResponse));

    component.submitReply();

    expect(notificationService.addNotificationReply).toHaveBeenCalledWith(
      component.notification.notificationId,
      component.patient.patientId,
      component.operation.operationId,
      {
        replyText: 'Test reply',
        userId: component.currentUserId
      }
    );
    expect(modalController.dismiss).toHaveBeenCalledWith({
      success: true,
      submitted: true,
      reply: mockResponse,
      replyText: 'Test reply'
    });
    expect(component.replyText).toBe('');
    expect(component.isSubmitting).toBeFalsy();
  });

  it('should handle submission errors', () => {
    component.replyText = 'Test reply';
    const mockError = { error: { message: 'Server error' } };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    notificationService.addNotificationReply.mockReturnValue(throwError(mockError));

    component.submitReply();

    expect(component.submitError).toBe('Server error');
    expect(component.isSubmitting).toBeFalsy();
    expect(modalController.dismiss).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should close modal on cancel', () => {
    component.closeAndCancel();
    expect(modalController.dismiss).toHaveBeenCalledWith({ dismissed: true });
    expect(component.replyText).toBe('');
  });

  it('should disable submit button when form is invalid', () => {
    component.replyText = '';
    expect(component.isValid).toBeFalsy();

    component.replyText = 'Valid reply';
    expect(component.isValid).toBeTruthy();
  });
});
