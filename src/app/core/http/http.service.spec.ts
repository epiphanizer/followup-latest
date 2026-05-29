import { HttpService, HTTP_DYNAMIC_INTERCEPTORS } from './http.service';
import { HttpClient } from '@angular/common/http';

describe('HttpService (Jest)', () => {
  it('exports the HttpService symbol', () => {
    expect(HttpService).toBeTruthy();
  });

  it('defines HTTP_DYNAMIC_INTERCEPTORS token', () => {
    expect(HTTP_DYNAMIC_INTERCEPTORS).toBeTruthy();
  });

  it('extends HttpClient at the type level', () => {
    const prototype = Object.getPrototypeOf(HttpService.prototype);
    expect(prototype).toBe(HttpClient.prototype);
  });
});
