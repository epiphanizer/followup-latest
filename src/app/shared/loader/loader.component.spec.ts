import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';

import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;
  const isLoadingSubject = new Subject<boolean>();
  const loaderStub = {
    isLoading: isLoadingSubject,
    show: jest.fn(() => isLoadingSubject.next(true)),
    hide: jest.fn(() => isLoadingSubject.next(false))
  } as LoaderService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [IonicModule.forRoot()],
        declarations: [LoaderComponent],
        providers: [{ provide: LoaderService, useValue: loaderStub }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not be visible by default', () => {
    const element = fixture.nativeElement;
    expect(element.querySelector('.overlay')).toBeNull();
  });

  it('should be visible when app is loading', () => {
    loaderStub.show();
    fixture.detectChanges();
    const element = fixture.nativeElement;
    expect(element.querySelector('.overlay')).not.toBeNull();
  });

  it('intercepts requests and toggles loader visibility', () => {
    jest.useFakeTimers();
    const handler = { handle: jest.fn(() => of({} as any)) } as any;
    const req = new HttpRequest('GET', '/api/test');

    component.intercept(req, handler).subscribe();

    jest.advanceTimersByTime(600);
    expect(loaderStub.show).toHaveBeenCalled();

    jest.advanceTimersByTime(1600);
    expect(loaderStub.hide).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
