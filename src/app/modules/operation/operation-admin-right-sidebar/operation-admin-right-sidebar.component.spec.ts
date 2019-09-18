import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationAdminRightSidebarComponent } from './operation-admin-right-sidebar.component';

describe('OperationAdminRightSidebarComponent', () => {
  let component: OperationAdminRightSidebarComponent;
  let fixture: ComponentFixture<OperationAdminRightSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationAdminRightSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAdminRightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
