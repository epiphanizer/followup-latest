import { OperationContact } from './operation-contact/operation-contact';
import { OperationCallRep } from './operation-callreps.service';

export interface OperationPutBody {
  operationActive: number;
  operationName: string;
  operationContacts: OperationContact[];
  operationCallReps: OperationCallRep[];
}
export interface OperationCallRepPostBody {
  operationId: number;
  userId: number;
}
