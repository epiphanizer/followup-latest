import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  public selected:
    | {
        operation: {
          operationId: number;
        };
      }
    | any = {};
  public operations$: Subscription | null = null;
  user: User;
  constructor() {}
  ngOnInit() {}
  ngOnChanges() {}
}
