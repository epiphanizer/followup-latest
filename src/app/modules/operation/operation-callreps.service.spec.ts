import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { OperationCallRepsService } from './operation-callreps.service';

describe('OperationCallRepsService (Jest)', () => {
  const httpMock = {
    get: jest.fn(() => of([])),
    post: jest.fn(() => of({ operationCallRepId: 'ocr-1' })),
    delete: jest.fn(() => of({})),
    isLoading: { next: jest.fn() }
  } as any;

  const buildService = () => new OperationCallRepsService(httpMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches, adds, and deletes call reps', () => {
    const service = buildService();

    service.getOperationCallRepsByOperationId('op1').subscribe();
    expect(httpMock.get).toHaveBeenCalledWith('operations/op1/callreps', {});

    service.addOperationCallRepByOperationIdAndUserId('op1', 'u1').subscribe();
    expect(httpMock.post).toHaveBeenCalledWith('operations/op1/callreps/u1', {});

    service.deleteOperationCallRepByOperationCallRepId('op1', 'cr1').subscribe();
    expect(httpMock.delete).toHaveBeenCalledWith('operations/op1/callreps/cr1', {});
  });

  it('handles backend errors gracefully', done => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    httpMock.get.mockReturnValueOnce(throwError(new HttpErrorResponse({ status: 500, error: 'fail' })));
    const service = buildService();

    service.getOperationCallRepsByOperationId('op1').subscribe({
      error: err => {
        expect(consoleSpy).toHaveBeenCalled();
        expect(err).toContain('patient service');
        consoleSpy.mockRestore();
        done();
      }
    });
  });
});
