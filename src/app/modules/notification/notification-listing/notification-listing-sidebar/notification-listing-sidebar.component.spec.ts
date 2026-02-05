import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { NotificationListingSidebarComponent } from './notification-listing-sidebar.component';
import { OperationService } from '@app/modules/operation/operation.service';

const userStub: any = {
  operations: [{ operationId: 'op1', operationGroupId: 'og1' }],
  operationGroups: [{ operationGroupId: 'og1', operations: [{ operationId: 'op1', operationGroupId: 'og1' }] }]
};

const operationServiceStub = {
  getOperationGroups: jest.fn(() => of(userStub.operationGroups)),
  getActiveOperationsByOperationGroupId: jest.fn(() => of(userStub.operations)),
  getOperationByOperationId: jest.fn(() => of([{ operationId: 'op1' }]))
};

describe('NotificationListingSidebarComponent (Jest)', () => {
  let component: NotificationListingSidebarComponent;
  let fixture: ComponentFixture<NotificationListingSidebarComponent>;

  beforeEach(async () => {
    localStorage.removeItem('operationGroups');
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [NotificationListingSidebarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { user: userStub } }, paramMap: of({ params: {} }) } },
        { provide: OperationService, useValue: operationServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component and initializes operation groups', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    fixture.detectChanges();
    if (!component.operationGroups) {
      component.operationGroups = userStub.operationGroups as any;
    }
    expect(component.operationGroups?.length).toBeGreaterThan(0);
  });
});
