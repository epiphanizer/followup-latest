import { OperationOperationListingComponent } from './operation-operation-listing.component';

const buildOperation = (overrides: any = {}) => ({
  operationGroupId: 'g1',
  operationName: 'Alpha',
  operationGroupName: 'Group 1',
  currentAssignedPatientCount: 1,
  totalNotifications: 2,
  totalGraduates: 3,
  operationActive: 1,
  operationCreated: '2024-01-02',
  operationEdited: '2024-01-03',
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

  it('does not fallback to user operations in client mode when selected group operations are empty', () => {
    const clientRouteStub = {
      snapshot: {
        data: {
          section: 'clients',
          user: {
            operations: [otherGroup]
          }
        }
      }
    } as any;
    const component = new OperationOperationListingComponent(clientRouteStub);
    component.operationGroup = { operationGroupId: 'g1', operations: [] } as any;

    component.ngOnInit();

    expect(component.operationsFiltered.length).toBe(0);
  });

  it('filters operations by group on init', () => {
    const component = buildComponent();

    expect(component.operationsFiltered.length).toBe(2);
    expect(component.operationsFiltered.every(op => op.operationGroupId === 'g1')).toBe(true);
  });

  it('prefers hydrated operationGroup.operations over user operation fallback on init', () => {
    const component = new OperationOperationListingComponent(routeStub);
    component.operationGroup = {
      operationGroupId: 'g1',
      operations: [buildOperation({ operationName: 'Hydrated Facility' })]
    } as any;

    component.ngOnInit();

    expect(component.operationsFiltered.length).toBe(1);
    expect(component.operationsFiltered[0].operationName).toBe('Hydrated Facility');
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

  it('supports additional sort options and paging', () => {
    const component = buildComponent();
    const enriched = [
      buildOperation({
        operationName: 'Zeta',
        totalNotifications: 10,
        totalGraduates: 5,
        operationActive: 0,
        operationCreated: '2024-03-10',
        operationStartDate: '2023-01-01'
      }),
      buildOperation({
        operationName: 'Eta',
        totalNotifications: 2,
        totalGraduates: 1,
        operationActive: 1,
        operationCreated: '2024-01-05',
        operationStartDate: '2024-12-31'
      })
    ];
    component.operations = component.operationsFiltered = enriched as any;

    component.handleSortOptionEvent('Ownership');
    expect(component.operationsFiltered[0].operationGroupName).toBe('Group 1');

    component.handleSortOptionEvent('Notifs');
    expect(component.operationsFiltered[0].totalNotifications).toBe(10);

    component.handleSortOptionEvent('Grads');
    expect(component.operationsFiltered[0].totalGraduates).toBe(5);

    component.handleSortOptionEvent('Status');
    expect(component.operationsFiltered[0].operationActive).toBe(0);

    component.handleSortOptionEvent('Date');
    expect(component.operationsFiltered[0].operationName).toBe('Zeta');

    component.handleSortDirectionEvent('asc');
    expect(component.operationsFiltered[0].operationName).toBe('Eta');

    component.onChangePage([{ operationName: 'PageItem' } as any]);
    expect(component.pageOfItems[0].operationName).toBe('PageItem');
  });

  it('falls back to edited or start date when created date is unavailable', () => {
    const component = buildComponent();

    expect(
      component.getOperationAddedDate(
        buildOperation({ operationCreated: null, operationEdited: '2024-04-01', operationStartDate: '2024-01-01' }) as any
      )
    ).toBe('2024-04-01');

    expect(
      component.getOperationAddedDate(
        buildOperation({ operationCreated: null, operationEdited: null, operationStartDate: '2024-01-01' }) as any
      )
    ).toBe('2024-01-01');
  });
});
