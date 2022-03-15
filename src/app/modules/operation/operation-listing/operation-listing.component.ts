import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
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
  constructor(private _cdr: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.operationGroups = this.user.operationGroups;
    this.route.paramMap.subscribe((data: any) => {
      console.log('param map stuff');
      if (data.params.operationGroupId) {
        this.selected.operationGroup = this.operationGroups.filter(operationGroup => {
          return data.params.operationGroupId == operationGroup.operationGroupId;
        })[0];
        console.log(this.selected.operationGroup);
        this._cdr.detectChanges();
      } else {
        this.selected.operationGroup = this.user.operationGroups[0];
      }
    });
  }

  operationGroupChangeEventHandler($event: Operation) {
    this.selected.operationGroup = $event;
  }
}
