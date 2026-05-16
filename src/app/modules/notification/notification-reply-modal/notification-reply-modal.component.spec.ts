import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NotificationReplyModalComponent } from './notification-reply-modal.component';
import { NotificationService } from '../../notification.service';
import { of, throwError } from 'rxjs';

describe('NotificationReplyModalComponent', () => {
  let component: NotificationReplyModalComponent;
  let fixture: ComponentFixture<NotificationReplyModalComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['addNotificationReply']);

    await TestBed.configureTestingModule({
      declarations: [NotificationReplyModalComponent],
      imports: [FormsModule],
      providers: [{ provide: NotificationService, useValue: notificationServiceSpy }]
    }).compileComponents();

    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    fixture = TestBed.createComponent(NotificationReplyModalComponent);
    component = fixture.componentInstance;
    component.notification = { notificationId: 1, notificationTypeLabel: 'Test' };
    component.patient = { patientId: 1, patientFirstName: 'John', patientLastName: 'Doe' };
    component.operation = { operationId: 1, operationGroupName: 'Test Operation' };
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

  it('should submit reply successfully', done => {
    component.replyText = 'Test reply';
    const mockResponse = { notificationReplyId: 'abc123' };
    notificationService.addNotificationReply.and.returnValue(of(mockResponse));

    component.submitReply();

    setTimeout(() => {
      expect(notificationService.addNotificationReply).toHaveBeenCalledWith(
        component.notification.notificationId,
        component.patient.patientId,
        component.operation.operationId,
        {
          replyText: 'Test reply',
          userId: component.currentUserId
        }
      );
      expect(component.replySubmitted.emit).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle submission errors', done => {
    component.replyText = 'Test reply';
    const mockError = { error: { message: 'Server error' } };
    notificationService.addNotificationReply.and.returnValue(throwError(mockError));

    component.submitReply();

    setTimeout(() => {
      expect(component.submitError).toBe('Server error');
      expect(component.isSubmitting).toBeFalsy();
      done();
    }, 100);
  });

  it('should close modal on cancel', () => {
    spyOn(component.closeModal, 'emit');
    component.closeAndCancel();
    expect(component.closeModal.emit).toHaveBeenCalled();
    expect(component.replyText).toBe('');
  });

  it('should disable submit button when form is invalid', () => {
    component.replyText = '';
    expect(component.isValid).toBeFalsy();

    component.replyText = 'Valid reply';
    expect(component.isValid).toBeTruthy();
  });
});
