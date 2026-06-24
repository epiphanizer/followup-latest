import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationAdminSidebarComponent } from './operation-admin-sidebar.component';
import { OperationService } from '../operation.service';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '@app/modules/user/user.service';

function createParamMap(params: Record<string, string> = {}) {
  return {
    get: (key: string) => params[key] || null,
    params
  };
}

function createRouteMock(dataOverrides: any = {}, params: Record<string, string> = {}) {
  return {
    snapshot: {
      data: {
        user: {
          operations: [{ operationId: 'op1', operationGroupId: 'g1' }],
          operationGroups: [
            {
              operationGroupId: 'g1',
              operations: [{ operationId: 'op1', operationGroupId: 'g1' }],
              sidebarDropdownOpen: false
            },
            {
              operationGroupId: 'g2',
              operations: [{ operationId: 'op2', operationGroupId: 'g2' }],
              sidebarDropdownOpen: false
            }
          ]
        },
        operation: null,
        ...dataOverrides
      }
    },
    paramMap: { subscribe: (fn: any) => fn(createParamMap(params)) }
  };
}

describe('OperationAdminSidebarComponent', () => {
  let component: OperationAdminSidebarComponent;
  let fixture: ComponentFixture<OperationAdminSidebarComponent>;
  let consoleLogSpy: jest.SpyInstance;
  let clientGroupsChanged$: Subject<void>;
  const operationServiceMock: any = {
    getAllOperationGroups: jest.fn(() =>
      of([
        { operationGroupId: 'g1', operationGroupName: 'Group One', operationGroupShortName: 'G1', operationGroupActive: 1 },
        { operationGroupId: 'g2', operationGroupName: 'Group Two', operationGroupShortName: 'G2', operationGroupActive: 0 }
      ])
    ),
    getOperationGroups: jest.fn(() =>
      of([
        { operationGroupId: 'g1', operations: [], sidebarDropdownOpen: false },
        { operationGroupId: 'g2', operations: [], sidebarDropdownOpen: false }
      ])
    ),
    getActiveOperationsByOperationGroupId: jest.fn(() => of([{ operationId: 'op1', operationGroupId: 'g1' }] as any)),
    getOperationByOperationId: jest.fn((operationId: string) =>
      of([
        {
          operationId,
          operationGroupId: operationId === 'op2' ? 'g2' : 'g1'
        }
      ] as any)
    )
  };
  const routeMock: any = createRouteMock();

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperationAdminSidebarComponent],
        imports: [RouterTestingModule, NoopAnimationsModule],
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: OperationService, useValue: operationServiceMock },
          { provide: UserService, useValue: { updateOperations: jest.fn(() => Promise.resolve()) } },
          { provide: ChangeDetectorRef, useValue: { detectChanges: jest.fn() } }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
    clientGroupsChanged$ = new Subject<void>();
    operationServiceMock.clientGroupsChanged$ = clientGroupsChanged$.asObservable();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    fixture = TestBed.createComponent(OperationAdminSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    consoleLogSpy?.mockRestore();
  });

  it('emits selected operation changes', () => {
    const emitSpy = jest.spyOn(component.operationChangeEvent, 'emit');
    component.setActiveOperation({ operationId: 'op2', operationGroupId: 'g2' } as any);

    expect(component.activeOperationId).toBe('op2');
    expect(component.activeOperationGroupId).toBe('g2');
    expect(emitSpy).toHaveBeenCalledWith('op2');
  });

  it('opens and emits selected operation group', () => {
    const emitSpy = jest.spyOn(component.operationGroupChangeEvent, 'emit');
    const group = { operationGroupId: 'g2', sidebarDropdownOpen: false } as any;

    component.setActiveOperationGroup(group);

    expect(group.sidebarDropdownOpen).toBe(true);
    expect(component.activeOperationGroupId).toBe('g2');
    expect(emitSpy).toHaveBeenCalledWith('g2');
  });

  it('toggles sidebar menu and marks as touched', () => {
    const group = { sidebarDropdownOpen: false } as any;
    component.isTouched = false;
    component.toggleOperationSidebarMenu(group);

    expect(component.isTouched).toBe(true);
    expect(group.sidebarDropdownOpen).toBe(true);
  });

  it('collapses an active group when its label is clicked again', () => {
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const group = { operationGroupId: 'g1', sidebarDropdownOpen: true } as any;

    component.activeOperationGroupId = 'g1';
    component.handleOperationGroupClick(group, { preventDefault, stopPropagation } as any);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(group.sidebarDropdownOpen).toBe(false);
  });

  it('opens a new group when its label is clicked', () => {
    const emitSpy = jest.spyOn(component.operationGroupChangeEvent, 'emit');
    const group = { operationGroupId: 'g2', sidebarDropdownOpen: false } as any;

    component.activeOperationGroupId = 'g1';
    component.handleOperationGroupClick(group);

    expect(group.sidebarDropdownOpen).toBe(true);
    expect(component.activeOperationGroupId).toBe('g2');
    expect(emitSpy).toHaveBeenCalledWith('g2');
  });

  it('does not crash when user has no operation groups', () => {
    const emptyRouteMock: any = {
      snapshot: {
        data: {
          user: {
            operations: [],
            operationGroups: []
          },
          operation: null
        }
      },
      paramMap: { subscribe: (fn: any) => fn(createParamMap()) }
    };
    const localComponent = new OperationAdminSidebarComponent(
      emptyRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );

    expect(() => localComponent.ngOnInit()).not.toThrow();
    expect(Array.isArray(localComponent.operationGroups)).toBe(true);
  });

  it('builds client routes when used from the clients section', () => {
    const clientsRouteMock: any = createRouteMock({ section: 'clients' });
    const localComponent = new OperationAdminSidebarComponent(
      clientsRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );

    localComponent.ngOnInit();

    expect(localComponent.clientMode).toBe(true);
    expect(operationServiceMock.getAllOperationGroups).toHaveBeenCalled();
    expect(localComponent.visibleOperationGroups.length).toBe(1);
    localComponent.setClientFilter('archived');
    expect(localComponent.visibleOperationGroups.length).toBe(1);
    expect(localComponent.getOperationGroupRoute({ operationGroupId: 'g1' } as any)).toEqual(['/clients', 'g1']);
  });

  it('collapses the open client filter when the same heading is clicked again', () => {
    const clientsRouteMock: any = createRouteMock({ section: 'clients' });
    const localComponent = new OperationAdminSidebarComponent(
      clientsRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );

    localComponent.ngOnInit();
    expect(localComponent.clientFilter).toBe('active');

    localComponent.setClientFilter('active');

    expect(localComponent.clientFilter).toBeNull();
    expect(localComponent.visibleOperationGroups).toEqual([]);
  });

  it('does not auto-select a different client when switching filters', () => {
    const clientsRouteMock: any = createRouteMock({ section: 'clients' });
    const localComponent = new OperationAdminSidebarComponent(
      clientsRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );
    const emitSpy = jest.spyOn(localComponent.operationGroupChangeEvent, 'emit');

    localComponent.ngOnInit();
    localComponent.selected.operationGroup = {
      operationGroupId: 'g1',
      operationGroupActive: 1
    } as any;
    localComponent.activeOperationGroupId = 'g1';

    localComponent.setClientFilter('archived');

    expect(localComponent.clientFilter).toBe('archived');
    expect(localComponent.selected.operationGroup?.operationGroupId).toBe('g1');
    expect(localComponent.activeOperationGroupId).toBe('g1');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('reloads client groups when notified of a successful archive or restore', () => {
    const clientsRouteMock: any = createRouteMock({ section: 'clients' });
    const localComponent = new OperationAdminSidebarComponent(
      clientsRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );

    localComponent.ngOnInit();
    expect(operationServiceMock.getAllOperationGroups).toHaveBeenCalledTimes(1);

    clientGroupsChanged$.next();

    expect(operationServiceMock.getAllOperationGroups).toHaveBeenCalledTimes(2);
  });

  it('syncs active group from routed operation group ids', () => {
    const groupedRouteMock: any = createRouteMock({}, { operationGroupId: 'g2' });
    const localComponent = new OperationAdminSidebarComponent(
      groupedRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );

    localComponent.ngOnInit();

    expect(localComponent.activeOperationGroupId).toBe('g2');
    expect(localComponent.selected.operationGroup?.operationGroupId).toBe('g2');
    expect(localComponent.operationGroups[0].sidebarDropdownOpen).toBe(false);
    expect(localComponent.operationGroups[1].sidebarDropdownOpen).toBe(true);
  });

  it('syncs active group from routed operations', () => {
    const operationRouteMock: any = createRouteMock({}, { operationId: 'op2' });
    const localComponent = new OperationAdminSidebarComponent(
      operationRouteMock,
      operationServiceMock,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any,
      {
        detectChanges: jest.fn()
      } as any
    );

    localComponent.ngOnInit();

    expect(operationServiceMock.getOperationByOperationId).toHaveBeenCalledWith('op2');
    expect(localComponent.activeOperationId).toBe('op2');
    expect(localComponent.activeOperationGroupId).toBe('g2');
    expect(localComponent.selected.operationGroup?.operationGroupId).toBe('g2');
    expect(localComponent.operationGroups[1].sidebarDropdownOpen).toBe(true);
  });
});
