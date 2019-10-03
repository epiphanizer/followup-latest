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
  notificationTypeIconImage?: string;
}
export interface NotificationTypes {
  notificationTypeId: number;
  notificationTypesLabel: number;
  notificationIconImage?: string;
}
export interface NotificationRecipient {
  notificationRecipientId: number;
  notificationRecipientContactFirstName: string;
  notificationRecipientContactLastName: string;
  notificationRecipientOperationId: string;
}
export interface NotificationPostBody {
  notificationMessage: string;
  notificationOperationId: number;
  notificationPatientId: number;
  notificationTypeId: number;
}
