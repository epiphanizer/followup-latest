import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationContactComponent } from './operation-contact.component';

describe('OperationContactComponent', () => {
  let component: OperationContactComponent;
  let fixture: ComponentFixture<OperationContactComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperationContactComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
