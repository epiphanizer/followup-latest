import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNextCallFinishButtonComponent } from './patient-next-call-finish-button.component';

describe('PatientNextCallFinishButtonComponent', () => {
  let component: PatientNextCallFinishButtonComponent;
  let fixture: ComponentFixture<PatientNextCallFinishButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientNextCallFinishButtonComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientNextCallFinishButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
