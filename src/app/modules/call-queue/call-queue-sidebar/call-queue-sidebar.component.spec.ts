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

  it('computes spanishNewDischarges from spanish operations with new discharges', () => {
    const route = { snapshot: { data: { user: { operationGroups: [] } } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const patientService = {} as any;
    const comp = new CallQueueSidebarComponent(route, operationService, patientService);

    (comp as any).operationGroups = [
      {
        operations: [
          { operationSpanishSpeaking: true, currentNewDischargeCount: '1' },
          { operationSpanishSpeaking: false, currentNewDischargeCount: '3' }
        ]
      }
    ];

    (comp as any).refreshSpanishNewDischarges();

    expect(comp.spanishNewDischarges).toBe(true);
  });

  it('does not default another operation active when the spanish route is open', done => {
    const user = {
      operationGroups: [
        {
          operationGroupId: 'g1',
          operationGroupShortName: 'G1',
          sidebarDropdownOpen: true,
          operations: [{ operationId: 'op-1', operationGroupId: 'g1', operationSpanishSpeaking: true }]
        }
      ],
      operations: [{ operationId: 'op-1', operationGroupId: 'g1', operationSpanishSpeaking: true }]
    } as any;

    const route = {
      snapshot: { data: { user, mode: 'spanish' } },
      data: { subscribe: (cb: any) => cb({ user, mode: 'spanish' }) },
      paramMap: { subscribe: (cb: any) => cb({ params: {} }) }
    } as any;
    const operationService = {
      getOperationGroups: jest.fn(() => of(user.operationGroups)),
      getActiveOperationsByOperationGroupId: jest.fn(() => of(user.operations)),
      getOperationByOperationId: jest.fn(() => of([{ operationId: 'op-1', operationGroupId: 'g1' }]))
    } as any;
    const patientService = {} as any;

    const comp = new CallQueueSidebarComponent(route, operationService, patientService);
    comp.ngOnInit();

    setTimeout(() => {
      expect(comp.isSpanishMode).toBe(true);
      expect(comp.selected.operation).toBeNull();
      expect(comp.activeOperationId).toBeNull();
      expect(user.operationGroups[0].sidebarDropdownOpen).toBe(false);
      expect(operationService.getOperationByOperationId).not.toHaveBeenCalled();
      done();
    }, 0);
  });
});
