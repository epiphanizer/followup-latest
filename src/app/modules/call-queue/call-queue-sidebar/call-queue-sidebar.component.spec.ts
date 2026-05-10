import { of } from 'rxjs';

import { CallQueueSidebarComponent } from './call-queue-sidebar.component';

describe('CallQueueSidebarComponent (Jest)', () => {
  beforeEach(() => localStorage.removeItem('operationGroups'));

  it('initializes selected operation from route/user defaults', done => {
    const user = {
      operationGroups: [
        {
          operationGroupId: 'g1',
          operationGroupShortName: 'G1',
          operations: [{ operationId: 'op-1', operationGroupId: 'g1' }]
        }
      ],
      operations: [{ operationId: 'op-1', operationGroupId: 'g1' }]
    } as any;

    const route = { snapshot: { data: { user } }, paramMap: { subscribe: (cb: any) => cb({ params: {} }) } } as any;
    const operationService = {
      getOperationGroups: jest.fn(() => of(user.operationGroups)),
      getActiveOperationsByOperationGroupId: jest.fn(() => of(user.operations)),
      getOperationByOperationId: jest.fn(() => of([{ operationId: 'op-1', operationGroupId: 'g1' }]))
    } as any;
    const patientService = {} as any;

    const comp = new CallQueueSidebarComponent(route, operationService, patientService);
    comp.ngOnInit();

    setTimeout(() => {
      expect(comp.selected.operation?.operationId).toBe('op-1');
      expect(comp.activeOperationId).toBe('op-1');
      expect(operationService.getOperationGroups).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('emits operation change and toggles menu state', () => {
    const route = { snapshot: { data: { user: {} } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const patientService = {} as any;
    const comp = new CallQueueSidebarComponent(route, operationService, patientService);
    const emitSpy = jest.spyOn(comp.operationChangeEvent, 'emit');
    const op = { operationId: 'op-1' } as any;

    comp.setActiveOperation(op);
    expect(comp.selected.operation).toBe(op);
    expect(comp.activeOperationId).toBe('op-1');
    expect(emitSpy).toHaveBeenCalledWith(op);

    const group = { sidebarDropdownOpen: false } as any;
    comp.toggleOperationSidebarMenu(group);
    expect(group.sidebarDropdownOpen).toBe(true);
    expect(comp.isTouched).toBe(true);
  });

  it('treats discharge counters as numeric for indicator checks', () => {
    const route = { snapshot: { data: { user: {} } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const patientService = {} as any;
    const comp = new CallQueueSidebarComponent(route, operationService, patientService);

    expect(comp.hasNewDischarges({ currentNewDischargeCount: 1 } as any)).toBe(true);
    expect(comp.hasNewDischarges({ currentNewDischargeCount: '1' } as any)).toBe(true);
    expect(comp.hasNewDischarges({ currentNewDischargeCount: 0 } as any)).toBe(false);
    expect(comp.hasNewDischarges({ currentNewDischargeCount: '0' } as any)).toBe(false);
    expect(comp.hasNewDischarges({ currentNewDischargeCount: null } as any)).toBe(false);
  });
});
