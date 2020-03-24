import { Component, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';
import { Subject, Observable } from 'rxjs';
import { HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  public isLoading: Subject<boolean> = this.loaderService.isLoading;
  private totalRequests = 0;

  constructor(public loaderService: LoaderService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.indexOf('reorder') < 0) {
      this.totalRequests++;

      // wait 250 ms, if this is a quick response, let's skip the loading screen
      setTimeout(() => {
        if (this.totalRequests > 0) {
          this.loaderService.show();
        }
      }, 500);
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (req.url.indexOf('reorder') < 0) {
          this.totalRequests--;
        }

        if (this.totalRequests === 0) {
          // minimum 1 second load after everything finishes!
          setTimeout(() => {}, 1500);
          this.loaderService.hide();
        }
      })
    );
  }
}
