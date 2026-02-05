import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { OperationListingComponent } from './operation-listing.component';

describe('OperationListingComponent (Jest)', () => {
  let component: OperationListingComponent;
  let fixture: ComponentFixture<OperationListingComponent>;

  const userStub = {
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
    await TestBed.configureTestingModule({
      declarations: [OperationListingComponent],
      providers: [
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
});
