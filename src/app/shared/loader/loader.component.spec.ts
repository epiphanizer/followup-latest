import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      declarations: [LoaderComponent],
      providers: [{ provide: LoaderService, useValue: loaderStub }]
    }).compileComponents();
  }));

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
});
