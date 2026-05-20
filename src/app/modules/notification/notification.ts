export interface Notification {
  notificationTypeId: string;
  notificationMessage: string;
  notificationId?: string;
  notificationTypeLabel?: string;
  notificationOperationId: string;
  notificationOperationName?: string;
  notificationPatientId: string;
  notificationPatientFirstName?: string;
  notificationPatientLastName?: string;
  notificationPatientMedicalRecordNumber?: number;
  notificationStatusId?: string;
  notificationLabelId?: string;
  notificationRecipients?: string[];
  notificationIconImage?: string;
  notificationCreatedByUserId: string;
  notificationCreatedDate?: Date;
  notificationUserFirstName?: string;
  notificationUserLastName?: string;
  notificationCreatedTime?: Date;
  notificationStatusLabelId?: string;
  notificationStatusLabel?: string;
  replyCount?: number;
}
export interface NotificationType {
  notificationTypeId: string;
  notificationTypeLabel: string;
  notificationIconImage?: string;
}
export interface NotificationRecipient {
  notificationRecipientId: string;
  notificationRecipientContactFirstName: string;
  notificationRecipientContactLastName: string;
  notificationRecipientOperationId: string;
}
export interface NotificationPostBody {
  notificationCreatedByUserId: string;
  notificationTypeId: string;
  notificationMessage: string;
  notificationOperationId: string;
  notificationPatientId: string;
}
export interface NotificationReply {
  notificationReplyId?: string;
  notificationId: string;
  patientId: string;
  operationId: string;
  replyText: string;
  replyCreatedByUserId: string;
  replyCreatedByUserFirstName?: string;
  replyCreatedByUserLastName?: string;
  replyCreatedTime?: Date;
}
export interface NotificationReplyPostBody {
  userId: string;
  replyText: string;
}

export interface NotificationStatusUpdateBody {
  notificationStatusLabelId: string;
}
