import { of } from 'rxjs';

import { CallQueueComponent } from './call-queue.component';

describe('CallQueueComponent (Jest)', () => {
  const operationService = {
    getOperationByOperationId: jest.fn((id: string) => of([{ operationId: id, operationGroupShortName: 'Grp' }]))
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks spanish mode when route data requests it', () => {
    const route = { snapshot: { data: { mode: 'spanish' } }, paramMap: of({ params: {} }) } as any;
    const comp = new CallQueueComponent(route, { detectChanges: jest.fn() } as any, operationService);

    comp.ngOnInit();

    expect(comp.mode.spanish).toBe(true);
  });

  it('defaults to first operation for the user when none provided', done => {
    const user = {
      operationGroups: [{ operationGroupId: 'g1', operationGroupShortName: 'G1', operations: [] }],
      operations: [
        { operationId: 'op-1', operationGroupId: 'g1', operationGroupShortName: 'G1' },
        { operationId: 'op-2', operationGroupId: 'g2' }
      ]
    } as any;
    const route = { snapshot: { data: { user } }, paramMap: of({ params: {} }) } as any;
    const comp = new CallQueueComponent(route, { detectChanges: jest.fn() } as any, operationService);

    comp.ngOnInit();

    setTimeout(() => {
      expect(operationService.getOperationByOperationId).not.toHaveBeenCalled();
      expect(comp.selected.operation.operationGroupShortName).toBe('G1');
      expect(comp.mode.spanish).toBe(false);
      done();
    }, 0);
  });

  it('uses the hydrated user operation for explicit routes before falling back to the API', done => {
    const user = {
      operationGroups: [{ operationGroupId: 'g1', operationGroupShortName: 'G1', operations: [] }],
      operations: [{ operationId: 'op-2', operationGroupId: 'g1', operationGroupShortName: 'G1' }]
    } as any;
    const route = { snapshot: { data: { user } }, paramMap: of({ params: { operationId: 'op-2' } }) } as any;
    const comp = new CallQueueComponent(route, { detectChanges: jest.fn() } as any, operationService);

    comp.ngOnInit();

    setTimeout(() => {
      expect(operationService.getOperationByOperationId).not.toHaveBeenCalled();
      expect(comp.selected.operation.operationId).toBe('op-2');
      done();
    }, 0);
  });
});
