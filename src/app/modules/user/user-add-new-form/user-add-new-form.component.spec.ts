import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddNewFormComponent } from './user-add-new-form.component';

describe('UserAddNewFormComponent', () => {
  let component: UserAddNewFormComponent;
  let fixture: ComponentFixture<UserAddNewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserAddNewFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAddNewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
