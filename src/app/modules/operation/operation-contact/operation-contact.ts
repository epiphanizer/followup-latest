import { NotificationType } from '@app/modules/notification/notification';
import { FormArray } from '@angular/forms';

export interface OperationContact {
  operationContactOrder: number;
  operationContactId?: number;
  operationContactFirstName?: string;
  operationContactMiddleName?: string;
  operationContactLastName?: string;
  operationContactTitle?: string;
  operationContactEmail?: string;
  operationContactActive?: number;
  operationContactCountryCode?: string;
  operationContactAreaCode?: string;
  operationContactPhoneNumber?: string;
  operationContactNotifications?: FormArray;
}
