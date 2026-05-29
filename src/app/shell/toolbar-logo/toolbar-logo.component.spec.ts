import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarLogoComponent } from './toolbar-logo.component';

describe('ToolbarLogoComponent', () => {
  let component: ToolbarLogoComponent;
  let fixture: ComponentFixture<ToolbarLogoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ToolbarLogoComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
