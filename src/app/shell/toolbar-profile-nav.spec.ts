import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarProfileNavComponent } from './toolbar-profile-nav.component';

describe('ToolbarLogoComponent', () => {
  let component: ToolbarProfileNavComponent;
  let fixture: ComponentFixture<ToolbarProfileNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarProfileNavComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarProfileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
