import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { OperationListingComponent } from './operation-listing.component';
import { OperationService } from '../operation.service';

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
      operationServiceStub as any
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
      operationServiceStub as any
    );

    localComponent.ngOnInit();

    expect(operationServiceStub.getActiveOperationsByOperationGroupId).toHaveBeenCalled();
    expect(localComponent.selected.operationGroup.operationGroupId).toBe('missingGroup');
    expect(localComponent.selected.operationGroup.operations.length).toBe(1);
  });

  it('switches into client mode when routed from clients', () => {
    const operationServiceStub = {
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
      operationServiceStub as any
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
    const operationServiceStub = {
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
      operationServiceStub as any
    );

    localComponent.ngOnInit();
    expect(localComponent.selected.operationGroup.operations.length).toBe(1);

    paramMap$.next({ params: { operationGroupId: 'og1' } } as any);

    expect(localComponent.selected.operationGroup.operations.length).toBe(1);
    expect(operationServiceStub.getOperationsByOperationGroupId).toHaveBeenCalledTimes(1);
  });
});
