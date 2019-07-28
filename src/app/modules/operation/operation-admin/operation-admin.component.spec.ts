import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationAdminComponent } from './operation-admin.component';

describe('OperationAdminComponent', () => {
  let component: OperationAdminComponent;
  let fixture: ComponentFixture<OperationAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationAdminComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
