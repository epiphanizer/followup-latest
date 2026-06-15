import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { OperationListingComponent } from './operation-listing.component';
import { OperationService } from '../operation.service';
import { UserService } from '@app/modules/user/user.service';

describe('OperationListingComponent (Jest)', () => {
  let component: OperationListingComponent;
  let fixture: ComponentFixture<OperationListingComponent>;

  const userStub = {
    userId: 'u1',
    operations: [],
    operationGroups: [
      {
        operationGroupId: 'og1',
        operations: []
      },
      {
        operationGroupId: 'og2',
        operations: []
      }
    ]
  } as any;

  beforeEach(async () => {
    const operationServiceStub = {
      getAllOperationGroups: jest.fn().mockReturnValue(of(userStub.operationGroups)),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      declarations: [OperationListingComponent],
      providers: [
        { provide: OperationService, useValue: operationServiceStub },
        { provide: UserService, useValue: { updateOperations: jest.fn(() => Promise.resolve()) } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { user: userStub } },
            paramMap: of({ params: {} })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(OperationListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component and selects first operation group', () => {
    expect(component).toBeTruthy();
    expect(component.selected.operationGroup.operationGroupId).toBe('og1');
  });

  it('handles users with no operation groups', () => {
    const operationServiceStub = {
      getAllOperationGroups: jest.fn().mockReturnValue(of([])),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(of([]))
    };
    const route = {
      snapshot: { data: { user: { userId: 'u1', operations: [], operationGroups: [] } } },
      paramMap: of({ params: {} })
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    expect(() => localComponent.ngOnInit()).not.toThrow();
    expect(localComponent.selected.operationGroup).toBeNull();
  });

  it('hydrates group operations when selected group is not in user operationGroups', () => {
    const operationServiceStub = {
      getAllOperationGroups: jest.fn().mockReturnValue(of([])),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(
        of([
          {
            operationId: 'op1',
            operationGroupId: 'missingGroup'
          }
        ])
      ),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(of([]))
    };
    const route = {
      snapshot: { data: { user: { userId: 'u1', operations: [], operationGroups: [] } } },
      paramMap: of({ params: { operationGroupId: 'missingGroup' } })
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    localComponent.ngOnInit();

    expect(operationServiceStub.getActiveOperationsByOperationGroupId).toHaveBeenCalled();
    expect(localComponent.selected.operationGroup.operationGroupId).toBe('missingGroup');
    expect(localComponent.selected.operationGroup.operations.length).toBe(1);
  });

  it('switches into client mode when routed from clients', () => {
    const clientGroupsChanged$ = new Subject<void>();
    const operationServiceStub = {
      clientGroupsChanged$: clientGroupsChanged$.asObservable(),
      getAllOperationGroups: jest.fn().mockReturnValue(
        of([
          {
            operationGroupId: 'og1',
            operationGroupName: 'Client One',
            operationGroupShortName: 'CO',
            operationGroupActive: 1,
            operations: []
          }
        ])
      ),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(
        of([
          {
            operationId: 'op1',
            operationGroupId: 'og1',
            operationName: 'Facility 1'
          }
        ])
      )
    };
    const route = {
      snapshot: { data: { user: userStub, section: 'clients', title: 'Clients' } },
      paramMap: of({ params: {} })
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    localComponent.ngOnInit();

    expect(localComponent.clientMode).toBe(true);
    expect(localComponent.pageTitle).toBe('Clients');
    expect(operationServiceStub.getAllOperationGroups).toHaveBeenCalled();
    expect(operationServiceStub.getOperationsByOperationGroupId).toHaveBeenCalled();
    expect(localComponent.selected.operationGroup.operations.length).toBe(1);
  });

  it('keeps hydrated operations when route emits same client group again', () => {
    const paramMap$ = new BehaviorSubject({ params: { operationGroupId: 'og1' } } as any);
    const clientGroupsChanged$ = new Subject<void>();
    const operationServiceStub = {
      clientGroupsChanged$: clientGroupsChanged$.asObservable(),
      getAllOperationGroups: jest.fn().mockReturnValue(
        of([
          {
            operationGroupId: 'og1',
            operationGroupName: 'Client One',
            operationGroupShortName: 'CO',
            operationGroupActive: 1,
            operations: []
          }
        ])
      ),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(
        of([
          {
            operationId: 'op1',
            operationGroupId: 'og1',
            operationName: 'Facility 1'
          }
        ])
      )
    };
    const route = {
      snapshot: { data: { user: userStub, section: 'clients', title: 'Clients' } },
      paramMap: paramMap$.asObservable()
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    localComponent.ngOnInit();
    expect(localComponent.selected.operationGroup.operations.length).toBe(1);

    paramMap$.next({ params: { operationGroupId: 'og1' } } as any);

    expect(localComponent.selected.operationGroup.operations.length).toBe(1);
    expect(operationServiceStub.getOperationsByOperationGroupId).toHaveBeenCalledTimes(1);
  });

  it('ignores stale hydration responses after rapid client group switches', () => {
    const paramMap$ = new BehaviorSubject({ params: { operationGroupId: 'og1' } } as any);
    const og1$ = new Subject<any[]>();
    const og2$ = new Subject<any[]>();
    const clientGroupsChanged$ = new Subject<void>();
    const operationServiceStub = {
      clientGroupsChanged$: clientGroupsChanged$.asObservable(),
      getAllOperationGroups: jest.fn().mockReturnValue(
        of([
          {
            operationGroupId: 'og1',
            operationGroupName: 'Client One',
            operationGroupShortName: 'C1',
            operationGroupActive: 1,
            operations: []
          },
          {
            operationGroupId: 'og2',
            operationGroupName: 'Client Two',
            operationGroupShortName: 'C2',
            operationGroupActive: 1,
            operations: []
          }
        ])
      ),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn((group: any) => {
        if (group.operationGroupId === 'og1') {
          return og1$.asObservable();
        }

        return og2$.asObservable();
      })
    };
    const route = {
      snapshot: { data: { user: userStub, section: 'clients', title: 'Clients' } },
      paramMap: paramMap$.asObservable()
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    localComponent.ngOnInit();
    paramMap$.next({ params: { operationGroupId: 'og2' } } as any);

    og2$.next([
      {
        operationId: 'op-2',
        operationGroupId: 'og2',
        operationName: 'Facility Two'
      }
    ] as any);

    og1$.next([
      {
        operationId: 'op-1',
        operationGroupId: 'og1',
        operationName: 'Facility One'
      }
    ] as any);

    expect(localComponent.selected.operationGroup.operationGroupId).toBe('og2');
    expect(localComponent.selected.operationGroup.operations.length).toBe(1);
    expect(localComponent.selected.operationGroup.operations[0].operationId).toBe('op-2');
  });

  it('does not rehydrate when selecting identical client group id', () => {
    const clientGroupsChanged$ = new Subject<void>();
    const operationServiceStub = {
      clientGroupsChanged$: clientGroupsChanged$.asObservable(),
      getAllOperationGroups: jest.fn().mockReturnValue(
        of([
          {
            operationGroupId: 'og1',
            operationGroupName: 'Client One',
            operationGroupShortName: 'CO',
            operationGroupActive: 1,
            operations: []
          }
        ])
      ),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(
        of([
          {
            operationId: 'op1',
            operationGroupId: 'og1',
            operationName: 'Facility 1'
          }
        ])
      )
    };
    const route = {
      snapshot: { data: { user: userStub, section: 'clients', title: 'Clients' } },
      paramMap: of({ params: { operationGroupId: 'og1' } })
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    localComponent.ngOnInit();
    expect(operationServiceStub.getOperationsByOperationGroupId).toHaveBeenCalledTimes(1);

    localComponent.operationGroupChangeEventHandler('og1');

    expect(operationServiceStub.getOperationsByOperationGroupId).toHaveBeenCalledTimes(1);
  });

  it('reloads the client roster when client groups change and no specific client is routed', () => {
    const paramMap$ = new BehaviorSubject({ params: {} } as any);
    const clientGroupsChanged$ = new Subject<void>();
    const operationServiceStub = {
      clientGroupsChanged$: clientGroupsChanged$.asObservable(),
      getAllOperationGroups: jest
        .fn()
        .mockReturnValueOnce(
          of([
            {
              operationGroupId: 'og1',
              operationGroupName: 'Client One',
              operationGroupShortName: 'C1',
              operationGroupActive: 1,
              operations: []
            }
          ])
        )
        .mockReturnValueOnce(
          of([
            {
              operationGroupId: 'og2',
              operationGroupName: 'Client Two',
              operationGroupShortName: 'C2',
              operationGroupActive: 1,
              operations: []
            }
          ])
        ),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest
        .fn()
        .mockReturnValueOnce(of([{ operationId: 'op1', operationGroupId: 'og1', operationName: 'Facility 1' }]))
        .mockReturnValueOnce(of([{ operationId: 'op2', operationGroupId: 'og2', operationName: 'Facility 2' }]))
    };
    const route = {
      snapshot: { data: { user: userStub, section: 'clients', title: 'Clients' } },
      paramMap: paramMap$.asObservable()
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      { updateOperations: jest.fn(() => Promise.resolve()) } as any
    );

    localComponent.ngOnInit();
    expect(localComponent.selected.operationGroup.operationGroupId).toBe('og1');

    clientGroupsChanged$.next();

    expect(operationServiceStub.getAllOperationGroups).toHaveBeenCalledTimes(2);
    expect(localComponent.selected.operationGroup.operationGroupId).toBe('og2');
    expect(localComponent.selected.operationGroup.operations[0].operationId).toBe('op2');
  });

  it('notifies client group listeners after restoring the selected archived client', () => {
    const clientGroupsChanged$ = new Subject<void>();
    const operationServiceStub = {
      clientGroupsChanged$: clientGroupsChanged$.asObservable(),
      notifyClientGroupsChanged: jest.fn(),
      restoreOperationGroupByOperationGroupId: jest.fn().mockReturnValue(of({ success: 1 })),
      getAllOperationGroups: jest.fn().mockReturnValue(
        of([
          {
            operationGroupId: 'og1',
            operationGroupName: 'Client One',
            operationGroupShortName: 'C1',
            operationGroupActive: 0,
            operations: []
          }
        ])
      ),
      getActiveOperationsByOperationGroupId: jest.fn().mockReturnValue(of([])),
      getOperationsByOperationGroupId: jest.fn().mockReturnValue(of([]))
    };
    const userServiceStub = { updateOperations: jest.fn(() => Promise.resolve()) };
    const route = {
      snapshot: { data: { user: userStub, section: 'clients', title: 'Clients' } },
      paramMap: of({ params: { operationGroupId: 'og1' } })
    } as any;
    const localComponent = new OperationListingComponent(
      { detectChanges: jest.fn() } as any,
      route,
      operationServiceStub as any,
      userServiceStub as any
    );

    localComponent.ngOnInit();
    localComponent.selected.operationGroup = {
      operationGroupId: 'og1',
      operationGroupName: 'Client One',
      operationGroupShortName: 'C1',
      operationGroupActive: 0,
      operations: []
    } as any;

    localComponent.restoreSelectedClient();

    expect(operationServiceStub.notifyClientGroupsChanged).toHaveBeenCalled();
    expect(userServiceStub.updateOperations).toHaveBeenCalledWith(localComponent.user);
  });
});
