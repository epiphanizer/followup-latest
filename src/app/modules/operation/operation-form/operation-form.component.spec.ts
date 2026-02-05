import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { OperationFormComponent } from './operation-form.component';
import { ToastrService } from 'ngx-toastr';
import { OperationService } from '../operation.service';

describe('OperationFormComponent', () => {
  let component: OperationFormComponent;
  let fixture: ComponentFixture<OperationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationFormComponent],
      providers: [
        { provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { user: { operationGroups: [] }, mode: 'add' }, queryParams: {} } }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: OperationService,
          useValue: {
            addNewOperation: jest.fn(() => of({ operationId: 'op1' })),
            getOperationGroups: jest.fn(() => of([]))
          }
        }
      ]
    })
      .overrideComponent(OperationFormComponent, {
        set: {
          providers: [
            { provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } },
            {
              provide: OperationService,
              useValue: {
                addNewOperation: jest.fn(() => of({ operationId: 'op1' })),
                getOperationGroups: jest.fn(() => of([]))
              }
            }
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
