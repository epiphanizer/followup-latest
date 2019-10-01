export interface Notification {
  notificationTypeId: number;
  notificationMessage: string;
  notificationId?: number;
  notificationTypeLabel?: string;
  notificationOperationName?: string;
  notificationPatientId?: number;
  notificationPatientFirstName?: string;
  notificationPatientLastName?: string;
  notificationStatusId?: string;
  notificationLabelId?: string;
  notificationRecipients?: string[];
}
export interface NotificationTypes {
  notificationTypeId: number;
  notificationTypesLabel: number;
  notificationIconImage?: string;
}
export interface NotificationRecipients {
  notificationRecipientId: number;
  notificationRecipientContactFirstName: string;
  notificationRecipientContactLastName: string;
  notificationRecipientOperationId: string;
}
