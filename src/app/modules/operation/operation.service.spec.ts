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

  it('creates a new operation group with name and shortName', done => {
    const http = makeHttp();
    http.post = jest.fn(() =>
      of({ operationGroupId: 'og1', operationGroupName: 'PACS', operationGroupShortName: 'WZ PACS' } as any)
    );
    const svc = new OperationService(http as any);

    svc.addNewOperationGroup('PACS', 'WZ PACS').subscribe((result: any) => {
      expect(result.operationGroupId).toBe('og1');
      expect(result.operationGroupName).toBe('PACS');
      expect(http.post).toHaveBeenCalledWith('operations/groups', {
        operationGroupName: 'PACS',
        operationGroupShortName: 'WZ PACS'
      });
      done();
    });
  });

  it('handles error when creating operation group fails', done => {
    const http = {
      post: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 400, error: 'Invalid group' })))
    } as any;
    const svc = new OperationService(http as any);

    svc.addNewOperationGroup('', '').subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err.message).toContain('operation API route');
        done();
      }
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

  it('does not overwrite localStorage on subsequent fetches', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of([{ operationGroupId: 'og1' }] as any));
    const svc = new OperationService(http as any);

    localStorage.setItem('operationGroups', JSON.stringify([{ operationGroupId: 'og-cached' }]));

    svc.getOperationGroups().subscribe((groups: any) => {
      const cached = JSON.parse(localStorage.getItem('operationGroups'));
      expect(cached[0].operationGroupId).toBe('og-cached');
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

  it('gets all operations by group regardless of active status', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of([{ operationId: 'op1', operationActive: 0 }] as any));
    const svc = new OperationService(http as any);
    const operationGroup = { operationGroupId: 'og-1' } as any;

    svc.getOperationsByOperationGroupId(operationGroup).subscribe((ops: any) => {
      expect(http.get).toHaveBeenCalledWith('operations/groups/og-1');
      expect(ops[0].operationActive).toBe(0);
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

  it('handles error when updating operation group fails', done => {
    const http = {
      put: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 404, error: 'Not found' })))
    } as any;
    const svc = new OperationService(http as any);

    svc.editOperationGroupByOperationGroupId('og-999', {} as any).subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err.message).toContain('operation API route');
        done();
      }
    });
  });

  it('removes call rep or manager from operation', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);

    svc.removeCallRepOrManager('op-1', 'user-1').subscribe(() => {
      expect(http.delete).toHaveBeenCalledWith('operations/op-1/callReps/user-1', {});
      done();
    });
  });

  it('removes manager from operation by id', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);

    svc.removeManagerByOperationIdAndUserId('op-1', 'user-1').subscribe(() => {
      expect(http.delete).toHaveBeenCalledWith('operations/op-1/managers/user-1', {});
      done();
    });
  });

  it('fetches operation managers by operation id', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of([{ userId: 'u1', managerLevel: 1 }] as any));
    const svc = new OperationService(http as any);

    svc.getOperationManagersByOperationId('op-1').subscribe((managers: any) => {
      expect(http.get).toHaveBeenCalledWith('operations/op-1/managers');
      expect(managers[0].userId).toBe('u1');
      done();
    });
  });

  it('edits operation details by id', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);
    const operationPut = { operationName: 'Updated' } as any;

    svc.editOperationByOperationId('op-1', operationPut).subscribe(() => {
      expect(http.put).toHaveBeenCalledWith('operations/op-1', operationPut);
      done();
    });
  });

  it('fetches all operations with error handling', done => {
    const http = makeHttp();
    const svc = new OperationService(http as any);

    svc.getAllOperations().subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('operations');
      done();
    });
  });

  it('fetches single operation by id', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of({ operationId: 'op1', operationName: 'Op1' } as any));
    const svc = new OperationService(http as any);

    svc.getOperationByOperationId('op-1').subscribe((op: any) => {
      expect(http.get).toHaveBeenCalledWith('operations/op-1');
      expect(op.operationId).toBe('op1');
      done();
    });
  });

  it('fetches operations by user id', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of([{ operationId: 'op1', operationName: 'User Op' }] as any));
    const svc = new OperationService(http as any);

    svc.getOperationsByUserId('u-1').subscribe((ops: any) => {
      expect(http.get).toHaveBeenCalledWith('users/u-1/operations');
      expect(ops[0].operationName).toBe('User Op');
      done();
    });
  });

  it('fetches users assigned to operation', done => {
    const http = makeHttp();
    http.get = jest.fn(() => of([{ userId: 'u1', userName: 'User1' }] as any));
    const svc = new OperationService(http as any);

    svc.getUsersAssignedByOperationId('op-1').subscribe((users: any) => {
      expect(http.get).toHaveBeenCalledWith('operations/op-1/users');
      expect(users[0].userId).toBe('u1');
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
