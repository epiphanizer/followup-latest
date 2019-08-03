import { Component, OnInit, Input } from '@angular/core';
import { User } from '@app/modules/user/user.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Operation, OperationService } from '@app/modules/operation/operation.service';
import { AuthenticationService } from '@app/core';

@Component({
  selector: 'app-call-queue',
  templateUrl: './call-queue.component.html',
  styleUrls: ['./call-queue.component.scss']
})
export class CallQueueComponent implements OnInit {
  public selected: {
    operation: {
      operationId: number;
    };
  } = {
    operation: { operationId: null }
  };
  public operation$: Observable<Operation> | null = null;
  user: User;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private operationService: OperationService
  ) {}
  ngOnInit() {
    this.authService.getUser().then((result: any) => {
      this.user = this.authService.user;
      console.log(this.user);
      debugger;
      this.selected.operation = <Operation>this.user.operations[0];
      this.operation$ = this.operationService.getOperationByOperationId(this.selected.operation.operationId);
    });
  }
}
