import { NotificationType } from '@app/modules/notification/notification';

export interface OperationContact {
  operationContactId: number;
  operationContactFirstName: string;
  operationContactLastName: string;
  operationContactEmail: string;
  operationContactNotificationTypes?: NotificationType[];
}
