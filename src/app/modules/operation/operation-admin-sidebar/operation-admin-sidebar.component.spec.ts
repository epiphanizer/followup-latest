import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationAdminSidebarComponent } from './operation-admin-sidebar.component';

describe('OperationAdminSidebarComponent', () => {
  let component: OperationAdminSidebarComponent;
  let fixture: ComponentFixture<OperationAdminSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationAdminSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAdminSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
