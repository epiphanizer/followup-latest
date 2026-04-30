import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { OperationService } from './operation.service';

describe('OperationService (Jest)', () => {
  beforeEach(() => localStorage.clear());

  const makeHttp = () => ({
    post: jest.fn(() => of({ id: 'p' } as any)),
    get: jest.fn(() => of([] as any)),
    put: jest.fn(() => of({ updated: true } as any)),
    delete: jest.fn(() => of({ deleted: true } as any))
  });

  it('creates a new operation', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);

    svc.addNewOperation().subscribe((result: any) => {
      expect(result).toEqual({ id: 'p' });
      expect(http.post).toHaveBeenCalledWith('operations', {});
      done();
    });
  });

  it('stores operation groups in localStorage on first fetch', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of([{ operationGroupId: 'og1' }] as any));
    const svc = new OperationService(http as any);

    svc.getOperationGroups().subscribe((groups: any) => {
      expect(groups[0].operationGroupId).toBe('og1');
      expect(localStorage.getItem('operationGroups')).toContain('og1');
      expect(http.get).toHaveBeenCalledWith('operations/groups');
      done();
    });
  });

  it('gets active operations by group and user', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);
    const operationGroup = { operationGroupId: 'og-1' } as any;
    const user = { userId: 'u-1' } as any;

    svc.getActiveOperationsByOperationGroupId(operationGroup, user).subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('operations/groups/og-1/active/u-1');
      done();
    });
  });

  it('updates operation group labels by id', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);

    svc
      .editOperationGroupByOperationGroupId('og-1', {
        operationGroupName: 'PACS',
        operationGroupShortName: 'WZ PACS'
      } as any)
      .subscribe(() => {
        expect(http.put).toHaveBeenCalledWith('operations/groups/og-1', {
          operationGroupName: 'PACS',
          operationGroupShortName: 'WZ PACS'
        });
        done();
      });
  });

  it('handles async errors', done => {
    const http = { get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' }))) } as any;
    const svc = new OperationService(http as any);

    svc.getAllOperations().subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err.message).toContain('operation API route');
        done();
      }
    });
  });
});
