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
});
