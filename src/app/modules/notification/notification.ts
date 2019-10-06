export interface Notification {
  notificationTypeId: number;
  notificationMessage: string;
  notificationId?: number;
  notificationTypeLabel?: string;
  notificationOperationId: number;
  notificationOperationName?: string;
  notificationPatientId: number;
  notificationPatientFirstName?: string;
  notificationPatientLastName?: string;
  notificationStatusId?: string;
  notificationLabelId?: string;
  notificationRecipients?: string[];
  notificationIconImage?: string;
  notificationCreatedByUserId: number;
  notificationCreatedDate?: Date;
}
export interface NotificationType {
  notificationTypeId: number;
  notificationTypeLabel: string;
  notificationIconImage?: string;
}
export interface NotificationRecipient {
  notificationRecipientId: number;
  notificationRecipientContactFirstName: string;
  notificationRecipientContactLastName: string;
  notificationRecipientOperationId: string;
}
export interface NotificationPostBody {
  notificationCreatedByUserId: number;
  notificationTypeId: number;
  notificationMessage: string;
  notificationOperationId: number;
  notificationPatientId: number;
}
