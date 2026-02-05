import { OperationOperationListingComponent } from './operation-operation-listing.component';

const buildOperation = (overrides: any = {}) => ({
  operationGroupId: 'g1',
  operationName: 'Alpha',
  operationGroupName: 'Group 1',
  currentAssignedPatientCount: 1,
  totalNotifications: 2,
  totalGraduates: 3,
  operationActive: 1,
  operationStartDate: '2024-01-01',
  ...overrides
});

describe('OperationOperationListingComponent (Jest)', () => {
  const baseOperations = [buildOperation(), buildOperation({ operationName: 'Beta', currentAssignedPatientCount: 3 })];
  const otherGroup = buildOperation({ operationGroupId: 'g2', operationName: 'Gamma' });
  const routeStub = {
    snapshot: {
      data: {
        user: {
          operations: [...baseOperations, otherGroup]
        }
      }
    }
  } as any;

  const buildComponent = () => {
    const component = new OperationOperationListingComponent(routeStub);
    component.operationGroup = { operationGroupId: 'g1', operations: baseOperations } as any;
    component.ngOnInit();
    return component;
  };

  it('filters operations by group on init', () => {
    const component = buildComponent();

    expect(component.operationsFiltered.length).toBe(2);
    expect(component.operationsFiltered.every(op => op.operationGroupId === 'g1')).toBe(true);
  });

  it('searches operations by name', () => {
    const component = buildComponent();

    const results = component.searchOperations('beta');
    expect(results.length).toBe(1);
    expect(results[0].operationName).toBe('Beta');
  });

  it('sorts by queue count and responds to direction changes', () => {
    const component = buildComponent();

    component.handleSortOptionEvent('Queue');
    expect(component.operationsFiltered[0].currentAssignedPatientCount).toBe(3);

    component.handleSortDirectionEvent('asc');
    expect(component.operationsFiltered[0].currentAssignedPatientCount).toBe(1);
  });

  it('re-sorts when the operation group changes', () => {
    const component = buildComponent();
    const swapped = {
      operationGroupId: 'g1',
      operations: [...baseOperations].reverse(),
      firstChange: false
    } as any;

    component.ngOnChanges({ operationGroup: { currentValue: swapped } as any });

    expect(component.operationsFiltered[0].operationName).toBe('Alpha');
    expect(component.operationsFiltered[1].operationName).toBe('Beta');
  });
});
