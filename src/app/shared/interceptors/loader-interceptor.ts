import { Injectable } from '@angular/core';
import { HttpContextToken, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { LoaderService } from '../loader/loader.service';

export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  // Guards against a hung backend request leaving the global spinner on forever.
  private readonly requestTimeoutMs = 30000;
  private requests: HttpRequest<any>[] = [];

  constructor(private loaderService: LoaderService) {}

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.loaderService.isLoading.next(this.requests.length > 0);
  }

  private isExpectedLoginAccountSelectionConflict(req: HttpRequest<any>, err: any): boolean {
    return !!(
      req?.url?.includes('/users/login') &&
      Number(err?.status) === 409 &&
      err?.error?.requiresAccountSelection
    );
  }

  private shouldSkipLoader(req: HttpRequest<any>): boolean {
    return req.context.get(SKIP_GLOBAL_LOADER);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldSkipLoader(req)) {
      return next.handle(req);
    }

    this.requests.push(req);
    this.loaderService.isLoading.next(true);

    return next.handle(req).pipe(
      timeout(this.requestTimeoutMs),
      catchError(err => {
        if (!this.isExpectedLoginAccountSelectionConflict(req, err)) {
          console.log(err);
        }
        return throwError(() => err);
      }),
      finalize(() => this.removeRequest(req))
    );
  }
}
