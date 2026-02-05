import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { OperationAdminSidebarComponent } from './operation-admin-sidebar.component';
import { OperationService } from '../operation.service';
import { ChangeDetectorRef } from '@angular/core';

describe('OperationAdminSidebarComponent', () => {
  let component: OperationAdminSidebarComponent;
  let fixture: ComponentFixture<OperationAdminSidebarComponent>;
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
        providers: [
          { provide: ActivatedRoute, useValue: routeMock },
          { provide: OperationService, useValue: operationServiceMock },
          { provide: ChangeDetectorRef, useValue: { detectChanges: jest.fn() } }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAdminSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
});
