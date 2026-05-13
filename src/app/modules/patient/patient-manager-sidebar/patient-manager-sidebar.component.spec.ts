import { PatientManagerSidebarComponent } from './patient-manager-sidebar.component';

describe('PatientManagerSidebarComponent (Jest)', () => {
  it('sets active operation and emits change', () => {
    const route = { snapshot: { data: { user: {} } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const comp = new PatientManagerSidebarComponent(route, operationService);
    const op = { operationId: 'op-1' } as any;
    const emitSpy = jest.spyOn(comp.operationChangeEvent, 'emit');

    comp.setActiveOperation(op);

    expect(comp.selected.operation).toBe(op);
    expect(comp.activeOperationId).toBe('op-1');
    expect(emitSpy).toHaveBeenCalledWith(op);
  });

  it('counts patients with new discharge correctly', () => {
    const route = { snapshot: { data: { user: {} } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const comp = new PatientManagerSidebarComponent(route, operationService);

    const patients = [{ patientCallCount: 1 } as any, { patientCallCount: 2 } as any, { patientCallCount: 1 } as any];

    expect(comp.getCurrentNewDischargeCount(patients)).toBe(2);
  });

  it('toggles sidebar menu state', () => {
    const route = { snapshot: { data: { user: {} } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const comp = new PatientManagerSidebarComponent(route, operationService);
    const groupA = { operationGroupId: 'og-1', sidebarDropdownOpen: false } as any;
    const groupB = { operationGroupId: 'og-2', sidebarDropdownOpen: true } as any;
    comp.operationGroups = [groupA, groupB];

    comp.toggleOperationSidebarMenu(groupA);

    expect(groupA.sidebarDropdownOpen).toBe(true);
    expect(groupB.sidebarDropdownOpen).toBe(false);
  });

  it('opens selected operation group when setting active operation', () => {
    const route = { snapshot: { data: { user: {} } }, paramMap: { subscribe: jest.fn() } } as any;
    const operationService = {} as any;
    const comp = new PatientManagerSidebarComponent(route, operationService);
    comp.operationGroups = [
      { operationGroupId: 'og-1', sidebarDropdownOpen: true },
      { operationGroupId: 'og-2', sidebarDropdownOpen: false }
    ] as any;

    comp.setActiveOperation({ operationId: 'op-2', operationGroupId: 'og-2' } as any);

    expect(comp.operationGroups[0].sidebarDropdownOpen).toBe(false);
    expect(comp.operationGroups[1].sidebarDropdownOpen).toBe(true);
  });
});
