import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationEditFormComponent } from './operation-edit-form.component';

describe('OperationEditFormComponent', () => {
  let component: OperationEditFormComponent;
  let fixture: ComponentFixture<OperationEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationEditFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
