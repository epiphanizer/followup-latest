import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { NotificationListingSidebarComponent } from './notification-listing-sidebar.component';
import { OperationService } from '@app/modules/operation/operation.service';

const userStub: any = {
  userId: 'u1',
  operations: [
    {
      operationId: 'op1',
      operationGroupId: 'og1',
      operationActive: 1,
      operationName: 'Alpha Active',
      currentAssignedPatientCount: 9
    }
  ],
  operationGroups: [
    {
      operationGroupId: 'og1',
      operationGroupActive: 1,
      operations: [
        {
          operationId: 'op1',
          operationGroupId: 'og1',
          operationActive: 1,
          operationName: 'Alpha Active',
          currentAssignedPatientCount: 9
        }
      ]
    }
  ]
};

const accessibleOperationsStub: any[] = [
  {
    operationId: 'op1',
    operationGroupId: 'og1',
    operationActive: 1,
    operationName: 'Alpha Active',
    currentAssignedPatientCount: 9
  },
  {
    operationId: 'op2',
    operationGroupId: 'og2',
    operationActive: 0,
    operationName: 'Archived Beta',
    currentAssignedPatientCount: 4
  }
];

const allOperationGroupsStub: any[] = [
  {
    operationGroupId: 'og1',
    operationGroupActive: 1,
    operations: []
  },
  {
    operationGroupId: 'og2',
    operationGroupActive: 0,
    operations: []
  }
];

const operationServiceStub = {
  getAllOperationGroups: jest.fn(() => of(allOperationGroupsStub)),
  getOperationsByUserId: jest.fn(() => of(accessibleOperationsStub)),
  getOperationByOperationId: jest.fn(() =>
    of([
      {
        operationId: 'op1',
        operationGroupId: 'og1',
        operationActive: 1,
        operationName: 'Alpha Active',
        currentAssignedPatientCount: 9
      }
    ])
  )
};

describe('NotificationListingSidebarComponent (Jest)', () => {
  let component: NotificationListingSidebarComponent;
  let fixture: ComponentFixture<NotificationListingSidebarComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    TestBed.overrideComponent(NotificationListingSidebarComponent, {
      set: {
        providers: [{ provide: OperationService, useValue: operationServiceStub }]
      }
    });

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [NotificationListingSidebarComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { user: userStub } }, paramMap: of({ get: (): null => null }) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates component and initializes default operation/group state', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.operationGroups?.length).toBeGreaterThan(0);
    expect(component.activeOperationId).toBe('op1');
    expect(component.facilityFilter).toBe('active');
    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(true);
  });

  it('hydrates archived notification facilities from the all-groups fetch instead of the cached user groups', () => {
    expect(operationServiceStub.getAllOperationGroups).toHaveBeenCalled();
    expect(operationServiceStub.getOperationsByUserId).toHaveBeenCalledWith('u1');
    expect(component.operationGroups.map((group: any) => group.operationGroupId)).toEqual(['og1', 'og2']);
    expect(component.facilityCounts).toEqual({ active: 1, archived: 1 });
  });

  it('hides the no-operations message until the sidebar operation load completes', () => {
    component.operationGroups = [];
    component.operationGroupsLoaded = false;

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain("You haven't been assigned any operations yet!");

    component.operationGroupsLoaded = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("You haven't been assigned any operations yet!");
  });

  it('sets active operation and opens only its operation group', () => {
    component.operationGroups = component.operationGroups.map((group: any, idx: number) => {
      return { ...group, sidebarDropdownOpen: idx === 0 };
    });
    const operation = { operationId: 'op2', operationGroupId: 'og2', operationName: 'Archived Beta' } as any;

    component.setActiveOperation(operation);

    expect(component.selected.operation).toBe(operation);
    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(false);
    expect(component.operationGroups[1].sidebarDropdownOpen).toBe(true);
    expect(component.activeOperationId).toBe('op2');
    expect(component.facilityFilter).toBe('archived');
  });

  it('toggles as an accordion (opens target and closes others)', () => {
    component.operationGroups = [
      { operationGroupId: 'og1', sidebarDropdownOpen: true } as any,
      { operationGroupId: 'og2', sidebarDropdownOpen: false } as any
    ];

    component.toggleOperationSidebarMenu(component.operationGroups[1]);

    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(false);
    expect(component.operationGroups[1].sidebarDropdownOpen).toBe(true);
  });

  it('filters facilities by active and archived state', () => {
    expect(component.facilityCounts).toEqual({ active: 1, archived: 1 });
    expect(component.visibleOperationGroups.map((group: any) => group.operationGroupId)).toEqual(['og1']);

    component.setFacilityFilter('archived');

    expect(component.visibleOperationGroups.map((group: any) => group.operationGroupId)).toEqual(['og2']);
    expect(component.activeOperationId).toBe('op2');
  });

  it('collapses the open facility filter when the same heading is clicked again', () => {
    const emitSpy = jest.spyOn(component.operationChangeEvent, 'emit');

    component.setFacilityFilter('active');

    expect(component.facilityFilter).toBeNull();
    expect(component.visibleOperationGroups).toEqual([]);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('keeps archived facility operations visible in the notifications sidebar', () => {
    const archivedGroup = component.operationGroups[1];
    const archivedOperation = archivedGroup.operations[0];

    expect(component.isOperationVisible(archivedGroup, archivedOperation)).toBe(true);
    expect(component.isOperationVisible(component.operationGroups[0], { operationActive: 0 } as any)).toBe(false);
  });

  it('handles selectedOperation changes before operation groups are initialized', () => {
    const freshComponent = new NotificationListingSidebarComponent({ snapshot: { data: {} } } as any, operationServiceStub as any);

    expect(() => {
      freshComponent.ngOnChanges({
        selectedOperation: new SimpleChange(null, { operationId: 'op2', operationGroupId: 'og2' }, true)
      });
    }).not.toThrow();

    expect(freshComponent.activeOperationId).toBe('op2');
    expect(freshComponent.facilityFilter).toBe('active');
  });

  it('switches back to an active operation when the active filter is selected', () => {
    const emitSpy = jest.spyOn(component.operationChangeEvent, 'emit');

    component.setActiveOperation({ operationId: 'op2', operationGroupId: 'og2', operationName: 'Archived Beta' } as any);
    component.operationGroups[0].sidebarDropdownOpen = false;

    component.setFacilityFilter('active');

    expect(component.facilityFilter).toBe('active');
    expect(component.activeOperationId).toBe('op1');
    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(true);
    expect(emitSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ operationId: 'op1', operationGroupId: 'og1' })
    );
  });

  it('keeps the current selection and reopens its group when reopening a matching filter', () => {
    const emitSpy = jest.spyOn(component.operationChangeEvent, 'emit');
    component.operationGroups[0].sidebarDropdownOpen = false;

    component.setFacilityFilter('active');
    component.setFacilityFilter('active');

    expect(component.activeOperationId).toBe('op1');
    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(true);
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
