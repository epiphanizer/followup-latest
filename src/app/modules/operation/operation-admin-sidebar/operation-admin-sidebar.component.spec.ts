import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OperationAdminSidebarComponent } from './operation-admin-sidebar.component';
import { OperationService } from '../operation.service';
import { ChangeDetectorRef } from '@angular/core';

describe('OperationAdminSidebarComponent', () => {
  let component: OperationAdminSidebarComponent;
  let fixture: ComponentFixture<OperationAdminSidebarComponent>;
  let consoleLogSpy: jest.SpyInstance;
  const operationServiceMock: any = {
    getOperationGroups: jest.fn(() => of([{ operationGroupId: 'g1', operations: [], sidebarDropdownOpen: false }])),
    getActiveOperationsByOperationGroupId: jest.fn(() => of([{ operationId: 'op1', operationGroupId: 'g1' }] as any)),
    getOperationByOperationId: jest.fn(() => of([{ operationId: 'op1', operationGroupId: 'g1' }] as any))
  };
  const routeMock: any = {
    snapshot: {
      data: {
        user: {
          operations: [{ operationId: 'op1' }],
          operationGroups: [
            { operationGroupId: 'g1', operations: [{ operationId: 'op1' }], sidebarDropdownOpen: false }
          ]
        },
        operation: null
      }
    },
    paramMap: { subscribe: (fn: any) => fn({ params: {} }) }
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperationAdminSidebarComponent],
        imports: [RouterTestingModule, NoopAnimationsModule],
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: OperationService, useValue: operationServiceMock },
          { provide: ChangeDetectorRef, useValue: { detectChanges: jest.fn() } }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
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
    component.setActiveOperation({ operationId: 'op2' } as any);

    expect(component.activeOperationId).toBe('op2');
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
      paramMap: { subscribe: (fn: any) => fn({ params: {} }) }
    };
    const localComponent = new OperationAdminSidebarComponent(emptyRouteMock, operationServiceMock, {
      detectChanges: jest.fn()
    } as any);

    expect(() => localComponent.ngOnInit()).not.toThrow();
    expect(Array.isArray(localComponent.operationGroups)).toBe(true);
  });

  it('builds client routes when used from the clients section', () => {
    const clientsRouteMock: any = {
      snapshot: {
        data: {
          user: routeMock.snapshot.data.user,
          operation: null,
          section: 'clients'
        }
      },
      paramMap: { subscribe: (fn: any) => fn({ params: {} }) }
    };
    const localComponent = new OperationAdminSidebarComponent(clientsRouteMock, operationServiceMock, {
      detectChanges: jest.fn()
    } as any);

    localComponent.ngOnInit();

    expect(localComponent.clientMode).toBe(true);
    expect(localComponent.getOperationGroupRoute({ operationGroupId: 'g1' } as any)).toEqual(['/clients', 'g1']);
  });
});
