import { Component, OnInit, Input } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { User } from '@app/modules/user/user';
import { OperationService } from '@app/modules/operation/operation.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

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
  constructor(private operationService: OperationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((data: any) => {
      console.log(data);
      if (data.params.operationGroupId) {
        var operationGroupId = data.params.operationGroupId;
        /**
         * Assign this operation group if passed thru router
         */
        this.operationService
          .getOperationGroupByOperationGroupId(operationGroupId)
          .subscribe((operationGroup: OperationGroup) => {
            console.log(operationGroup);
            this.selected.operationGroup = operationGroup[0];
          });
        this.operationGroups$ = this.operationService.getOperationGroups();
        this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
          this.operationGroups = operationGroups;
        });
      } else {
        this.operationGroups$ = this.operationService.getOperationGroups();
        this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
          console.log(operationGroups);
          this.operationGroups = operationGroups;
          this.selected.operationGroup = operationGroups[0];
        });
      }
    });
  }

  operationGroupChangeEventHandler($event: Operation) {
    this.selected.operationGroup = $event;
    this.operations$ = this.operationService
      .getOperationsByOperationGroupId(this.selected.operationGroup.operationGroupId)
      .pipe(
        map((operations: [Operation]) => {
          this.operations = operations;
          return operations;
        })
      );
  }
}
