import { Component, OnInit, Input } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { User } from '@app/modules/user/user';
import { OperationService } from '@app/modules/operation/operation.service';

@Component({
  selector: 'app-operation-listing',
  templateUrl: './operation-listing.component.html',
  styleUrls: ['./operation-listing.component.scss']
})
export class OperationListingComponent implements OnInit {
  public operationGroups: OperationGroup[];
  public operationGroups$: Observable<OperationGroup[]>;

  @Input() operationGroup: OperationGroup;

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

  ngOnInit() {
    this.operationGroups$ = this.operationService.getOperationGroups();
    this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
      this.operationGroups = operationGroups;
    });
  }
}
