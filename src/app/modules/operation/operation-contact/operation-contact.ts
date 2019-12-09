import { NotificationType } from '@app/modules/notification/notification';

export interface OperationContact {
  operationContactId: number;
  operationContactFirstName: string;
  operationContactMiddleName?: string;
  operationContactLastName: string;
  operationContactRelationship: string;
  operationContactEmail?: string;
  operationContactCountryCode: string;
  operationContactAreaCode: string;
  operationContactPhoneNumber: string;
  operationContactNotificationTypes?: NotificationType[];
}
