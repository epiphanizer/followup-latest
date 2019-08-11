import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallNotesComponent } from './patient-call-notes.component';

describe('PatientCallNotesComponent', () => {
  let component: PatientCallNotesComponent;
  let fixture: ComponentFixture<PatientCallNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallNotesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
