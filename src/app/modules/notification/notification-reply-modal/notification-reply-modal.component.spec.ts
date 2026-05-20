import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NotificationReplyModalComponent } from './notification-reply-modal.component';
import { NotificationService } from '../notification.service';
import { of, throwError } from 'rxjs';

describe('NotificationReplyModalComponent', () => {
  let component: NotificationReplyModalComponent;
  let fixture: ComponentFixture<NotificationReplyModalComponent>;
  let notificationService: {
    addNotificationReply: jest.Mock;
  };

  beforeEach(async () => {
    const notificationServiceSpy = {
      addNotificationReply: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [NotificationReplyModalComponent],
      imports: [FormsModule],
      providers: [{ provide: NotificationService, useValue: notificationServiceSpy }]
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService) as any;
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
    const replySubmittedSpy = jest.spyOn(component.replySubmitted, 'emit');
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
    expect(replySubmittedSpy).toHaveBeenCalledWith({
      success: true,
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
    const replySubmittedSpy = jest.spyOn(component.replySubmitted, 'emit');
    notificationService.addNotificationReply.mockReturnValue(throwError(mockError));

    component.submitReply();

    expect(component.submitError).toBe('Server error');
    expect(component.isSubmitting).toBeFalsy();
    expect(replySubmittedSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should close modal on cancel', () => {
    const closeModalSpy = jest.spyOn(component.closeModal, 'emit');
    component.closeAndCancel();
    expect(closeModalSpy).toHaveBeenCalled();
    expect(component.replyText).toBe('');
  });

  it('should disable submit button when form is invalid', () => {
    component.replyText = '';
    expect(component.isValid).toBeFalsy();

    component.replyText = 'Valid reply';
    expect(component.isValid).toBeTruthy();
  });
});
