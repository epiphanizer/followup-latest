import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

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
