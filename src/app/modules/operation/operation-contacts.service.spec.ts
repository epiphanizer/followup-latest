import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { OperationContactsService } from './operation-contacts.service';

describe('OperationContactsService (Jest)', () => {
  const httpMock = {
    post: jest.fn(() => of({ operationContactId: 'c1' })),
    put: jest.fn(() => of({})),
    delete: jest.fn(() => of({})),
    get: jest.fn(() => of([]))
  } as any;

  const buildService = () => new OperationContactsService(httpMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds, edits, deactivates and fetches contacts', () => {
    const service = buildService();
    const payload = {
      operationContactFirstName: 'Ada',
      operationContactLastName: 'Lovelace',
      operationContactCountryCode: '1',
      operationContactAreaCode: '415',
      operationContactPhoneNumber: '555',
      operationContactEmail: 'a@b.com',
      operationContactTitle: 'Mgr'
    } as any;

    service.addOperationContactByOperationId('op1', payload).subscribe();
    expect(httpMock.post).toHaveBeenCalledWith('operations/op1/contacts', payload);

    service.editOperationContactByOperationContactId('op1', 'c1', payload).subscribe();
    expect(httpMock.put).toHaveBeenCalledWith('operations/op1/contacts/c1', payload);

    service.deactivateOperationContactByOperationContactId('op1', 'c1').subscribe();
    expect(httpMock.delete).toHaveBeenCalledWith('operations/op1/contacts/c1');

    service.getOperationContactsByOperationId('op1').subscribe();
    expect(httpMock.get).toHaveBeenCalledWith('operations/op1/contacts');
  });

  it('handles client-side errors', done => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    httpMock.get.mockReturnValueOnce(
      throwError(new HttpErrorResponse({ error: new ErrorEvent('net', { message: 'down' }), status: 0 }))
    );
    const service = buildService();

    service.getOperationContactsByOperationId('op1').subscribe({
      error: err => {
        expect(consoleSpy).toHaveBeenCalledWith('An error occurred:', 'down');
        expect(err.message).toContain('operation API route');
        consoleSpy.mockRestore();
        done();
      }
    });
  });
});
