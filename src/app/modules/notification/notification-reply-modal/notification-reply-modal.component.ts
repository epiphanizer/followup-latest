import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NotificationReply } from '../notification';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification-reply-modal',
  templateUrl: './notification-reply-modal.component.html',
  styleUrls: ['./notification-reply-modal.component.scss']
})
export class NotificationReplyModalComponent implements OnInit {
  @Input() notification: any;
  @Input() patient: any;
  @Input() operation: any;
  @Input() currentUserId: string;

  @Output() replySubmitted = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  replyText: string = '';
  isSubmitting: boolean = false;
  submitError: string = '';
  maxCharacters: number = 2000;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.resetForm();
  }

  get characterCount(): number {
    return this.replyText.length;
  }

  get remainingCharacters(): number {
    return this.maxCharacters - this.characterCount;
  }

  get isValid(): boolean {
    return this.replyText.trim().length > 0 && this.characterCount <= this.maxCharacters;
  }

  submitReply(): void {
    if (!this.isValid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const replyPayload = {
      replyText: this.replyText.trim(),
      userId: this.currentUserId
    };

    this.notificationService
      .addNotificationReply(
        this.notification.notificationId,
        this.patient.patientId,
        this.operation.operationId,
        replyPayload
      )
      .subscribe(
        (response: NotificationReply) => {
          this.isSubmitting = false;
          this.replySubmitted.emit({
            success: true,
            reply: response,
            replyText: this.replyText
          });
          this.resetForm();
        },
        (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.submitError = error?.error?.message || 'Failed to submit reply. Please try again.';
          console.error('Error submitting notification reply:', error);
        }
      );
  }

  closeAndCancel(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  private resetForm(): void {
    this.replyText = '';
    this.submitError = '';
  }
}
