import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientEditFormComponent } from './patient-edit-form.component';

describe('PatientEditFormComponent', () => {
  let component: PatientEditFormComponent;
  let fixture: ComponentFixture<PatientEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientEditFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
