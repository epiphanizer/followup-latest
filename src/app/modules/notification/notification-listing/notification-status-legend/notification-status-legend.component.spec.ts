import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationStatusLegendComponent } from './notification-status-legend.component';

describe('NotificationStatusLegendComponent', () => {
  let component: NotificationStatusLegendComponent;
  let fixture: ComponentFixture<NotificationStatusLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationStatusLegendComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationStatusLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
