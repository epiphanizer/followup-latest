import { NotificationType } from '@app/modules/notification/notification';

export interface OperationContact {
  operationContactId: number;
  operationContactFirstName?: string;
  operationContactMiddleName?: string;
  operationContactLastName?: string;
  operationContactTitle?: string;
  operationContactEmail?: string;
  operationContactActive?: number;
  operationContactCountryCode?: string;
  operationContactAreaCode?: string;
  operationContactPhoneNumber?: string;
}
