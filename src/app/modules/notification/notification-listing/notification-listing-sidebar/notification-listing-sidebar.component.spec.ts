import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { NotificationListingSidebarComponent } from './notification-listing-sidebar.component';
import { OperationService } from '@app/modules/operation/operation.service';

const userStub: any = {
  operations: [{ operationId: 'op1', operationGroupId: 'og1' }],
  operationGroups: [
    { operationGroupId: 'og1', operations: [{ operationId: 'op1', operationGroupId: 'og1' }] },
    { operationGroupId: 'og2', operations: [{ operationId: 'op2', operationGroupId: 'og2' }] }
  ]
};

const operationServiceStub = {
  getOperationByOperationId: jest.fn(() => of([{ operationId: 'op1', operationGroupId: 'og1' }]))
};

describe('NotificationListingSidebarComponent (Jest)', () => {
  let component: NotificationListingSidebarComponent;
  let fixture: ComponentFixture<NotificationListingSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [NotificationListingSidebarComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { user: userStub } }, paramMap: of({ get: (): null => null }) }
        },
        { provide: OperationService, useValue: operationServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component and initializes default operation/group state', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.operationGroups?.length).toBeGreaterThan(0);
    expect(component.activeOperationId).toBe('op1');
    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(true);
  });

  it('sets active operation and opens only its operation group', () => {
    component.operationGroups = userStub.operationGroups.map((group: any, idx: number) => {
      return { ...group, sidebarDropdownOpen: idx === 0 };
    });
    const operation = { operationId: 'op2', operationGroupId: 'og2' } as any;

    component.setActiveOperation(operation);

    expect(component.selected.operation).toBe(operation);
    expect(component.operationGroups[0].sidebarDropdownOpen).toBe(false);
    expect(component.operationGroups[1].sidebarDropdownOpen).toBe(true);
    expect(component.activeOperationId).toBe('op2');
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
});
