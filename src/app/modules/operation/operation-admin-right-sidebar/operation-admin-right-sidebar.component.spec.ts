import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { OperationAdminRightSidebarComponent } from './operation-admin-right-sidebar.component';
import { OperationService } from '../operation.service';
import { OperationCallRepsService } from '../operation-callreps.service';
import { ToastrService } from 'ngx-toastr';

describe('OperationAdminRightSidebarComponent', () => {
  let component: OperationAdminRightSidebarComponent;
  let fixture: ComponentFixture<OperationAdminRightSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationAdminRightSidebarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map([['operationId', 'op1']])) } },
        { provide: OperationService, useValue: { getUsersAssignedByOperationId: jest.fn(() => of([])) } },
        { provide: OperationCallRepsService, useValue: { getOperationCallRepsByOperationId: jest.fn(() => of([])) } },
        { provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAdminRightSidebarComponent);
    component = fixture.componentInstance;
    component.mode = { add: true } as any;
    component.operation = { operationId: 'op1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
