import { CallQueueSidebarComponent } from './call-queue-sidebar.component';

describe('CallQueueSidebarComponent (Jest)', () => {
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
    expect(emitSpy).toHaveBeenCalledWith('op-1');

    const group = { sidebarDropdownOpen: false } as any;
    comp.toggleOperationSidebarMenu(group);
    expect(group.sidebarDropdownOpen).toBe(true);
    expect(comp.isTouched).toBe(true);
  });
});
