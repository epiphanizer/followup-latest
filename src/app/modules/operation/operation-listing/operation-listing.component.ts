import { Component, OnInit, Input } from '@angular/core';
import { Operation, OperationGroup } from '@app/modules/operation/operation';
import { Observable } from 'rxjs';
import { User } from '@app/modules/user/user';
import { OperationService } from '@app/modules/operation/operation.service';
import { ActivatedRoute } from '@angular/router';

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
    this.operationGroups$ = this.operationService.getOperationGroups();
    this.operationGroups$.subscribe((operationGroups: OperationGroup[]) => {
      this.operationGroups = operationGroups;
      this.selected.operationGroup = operationGroups[0];
    });

    // this.route.paramMap.subscribe((data: any) => {
    //   if (data.params.operationId) {
    //     this.operationService.getOperationByOperationId(data.params.operationId).subscribe((data: Operation) => {
    //       this.selected.operation = data[0];
    //     });
    //   } else {
    //     /** Init to the first user operation (alphabetically,) */
    //     // this.user = this.route.snapshot.data.user;
    //     // // this.operations = this.user.operations;
    //     // this.user.operations$.subscribe((data: Operation[]) => {
    //     //   /** Init to the first assigned operation alphabetically */
    //     //   this.operations = data;
    //     //   console.log(this.operations);
    //       /**
    //        * Filter for the proper ops group here
    //        */
    //       // this.selected.operation = this.operations[0];
    //       // this.activeOperationGroupId = this.selected.operationGroup.operationGroupId;
    //     // });
    //   }
    // });
  }
}
