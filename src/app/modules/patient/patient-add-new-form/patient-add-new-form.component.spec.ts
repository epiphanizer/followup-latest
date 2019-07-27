import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAddNewFormComponent } from './patient-add-new-form.component';

describe('PatientAddNewFormComponent', () => {
  let component: PatientAddNewFormComponent;
  let fixture: ComponentFixture<PatientAddNewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientAddNewFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAddNewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
