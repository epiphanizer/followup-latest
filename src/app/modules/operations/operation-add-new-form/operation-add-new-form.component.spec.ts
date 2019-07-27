import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationAddNewFormComponent } from './operation-add-new-form.component';

describe('OperationAddNewFormComponent', () => {
  let component: OperationAddNewFormComponent;
  let fixture: ComponentFixture<OperationAddNewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationAddNewFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAddNewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
