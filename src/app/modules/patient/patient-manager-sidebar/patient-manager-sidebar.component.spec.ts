import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientManagerSidebarComponent } from './patient-manager-sidebar.component';

describe('PatientManagerSidebarComponent', () => {
  let component: PatientManagerSidebarComponent;
  let fixture: ComponentFixture<PatientManagerSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientManagerSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientManagerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
