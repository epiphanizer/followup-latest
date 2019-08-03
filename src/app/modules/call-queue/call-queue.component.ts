import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Operation, OperationService } from '@app/modules/operation/operation.service';
import { AuthenticationService } from '@app/core';

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
  constructor(private authService: AuthenticationService) {}
  ngOnInit() {
    this.authService.getUser().then((result: any) => {
      this.user = this.authService.user;
      this.operations$ = this.user.operations$.subscribe((operation: Operation[]) => {
        this.selected.operation = operation[0];
        return operation;
      });
    });
  }
  ngOnChanges() {}
}
