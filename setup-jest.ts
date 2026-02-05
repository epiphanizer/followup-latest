import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HttpService } from '@app/core';
import { OperationService } from '@app/modules/operation/operation.service';
import { LoaderService } from '@app/shared/loader/loader.service';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OperationCallRepsService } from '@app/modules/operation/operation-callreps.service';
import { PatientCallStatusService } from '@app/modules/patient/patient-detail/patient-call/patient-call-status.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Subject, of as rxOf } from 'rxjs';

// Provide minimal mocks for browser APIs used by Ionic/Angular.
Object.defineProperty(window, 'CSS', { value: { supports: () => false, escape: (v: string) => v }, writable: true });
Object.defineProperty(document, 'doctype', { value: '<!DOCTYPE html>' });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({ display: 'none', appearance: ['-webkit-appearance'] })
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!(window as any).ResizeObserver) {
  (window as any).ResizeObserver = ResizeObserverMock as any;
}

// Provide a shallow, schema-tolerant TestBed setup for legacy specs.
const originalConfigureTestingModule = TestBed.configureTestingModule.bind(TestBed);
TestBed.configureTestingModule = (moduleDef: any = {}) => {
  const defaultImports = [
    IonicModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    RouterTestingModule,
    HttpClientTestingModule
  ];
  const defaultSchemas = [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA];
  const defaultProviders = [
    {
      provide: HttpService,
      useValue: {
        get: jest.fn(() => of({})),
        post: jest.fn(() => of({})),
        put: jest.fn(() => of({})),
        delete: jest.fn(() => of({})),
        cache: jest.fn().mockReturnThis(),
        skipErrorHandler: jest.fn().mockReturnThis(),
        disableApiPrefix: jest.fn().mockReturnThis()
      }
    },
    {
      provide: OperationService,
      useValue: {
        getOperations: jest.fn(() => of([])),
        getOperationGroups: jest.fn(() => of([])),
        getOperationById: jest.fn(() => of(null)),
        patchOperationById: jest.fn(() => of(null)),
        addOperation: jest.fn(() => of(null)),
        addNewOperation: jest.fn(() => of({ operationId: 'op1' })),
        updateOperation: jest.fn(() => of(null))
      }
    },
    {
      provide: OperationCallRepsService,
      useValue: {
        getOperationCallRepsByOperationId: jest.fn(() => of([])),
        addOperationCallRepByOperationIdAndUserId: jest.fn(() => of(null)),
        deleteOperationCallRepByOperationCallRepId: jest.fn(() => of(null))
      }
    },
    {
      provide: LoaderService,
      useFactory: () => {
        const subject = new Subject<boolean>();
        return {
          isLoading: subject,
          isLoading$: subject.asObservable ? subject.asObservable() : rxOf(false),
          show: jest.fn(() => subject.next(true)),
          hide: jest.fn(() => subject.next(false))
        };
      }
    },
    {
      provide: ToastrService,
      useValue: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn()
      }
    },
    {
      provide: JwtHelperService,
      useValue: {
        decodeToken: jest.fn(() => ({})),
        isTokenExpired: jest.fn(() => false)
      }
    },
    {
      provide: PatientCallStatusService,
      useValue: {
        getPatientCallStatuses: jest.fn(() => of([]))
      }
    },
    {
      provide: NgxImageCompressService,
      useValue: {
        uploadFile: jest.fn(() => Promise.resolve({ image: '', orientation: 0 })),
        compressFile: jest.fn(() => Promise.resolve(''))
      }
    }
  ];

  return originalConfigureTestingModule({
    ...moduleDef,
    imports: [...defaultImports, ...(moduleDef.imports || [])],
    schemas: [...defaultSchemas, ...(moduleDef.schemas || [])],
    providers: [...defaultProviders, ...(moduleDef.providers || [])]
  });
};
