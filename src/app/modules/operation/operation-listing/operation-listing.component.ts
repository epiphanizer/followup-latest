import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  selector: 'app-operation-listing',
  templateUrl: './operation-listing.component.html',
  styleUrls: ['./operation-listing.component.scss']
})
export class OperationListingComponent implements OnInit {
  @Input() operation: Operation;

  public operations: Operation[];
  public operations$: Observable<[Operation]> | void = null;
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(private operationService: OperationService) {}

  ngOnInit() {}
}
