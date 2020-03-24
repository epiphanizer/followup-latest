import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Logger, untilDestroyed } from '@app/core';
import { Subscription } from 'rxjs';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authenticated: boolean;
  constructor() {}

  ngOnInit() {}
  ngOnDestroy() {}
}
