import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor(private http: HttpService) {}

  log = function(error: any) {
    console.log(error);
  };
}
