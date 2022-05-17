import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../patient.service';
import { OperationService } from '@app/modules/operation/operation.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-patient-listing',
  templateUrl: './patient-listing.component.html',
  styleUrls: ['./patient-listing.component.scss']
})
export class PatientListingComponent implements OnInit {
  componentName: string = 'PatientListing';

  @Input() operation: Operation;
  filterDate: Date;
  mode: any = {
    spanish: false
  };
  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  patientsLoaded: boolean = false;

  public selected:
    | {
        filterDate: string;
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(
    private _cdr: ChangeDetectorRef,
    private patientService: PatientService,
    private operationService: OperationService,
    private route: ActivatedRoute,
    private location: LocationStrategy
  ) {
    this.location.onPopState(() => {
      window.location.reload();
    });
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (!this.route.snapshot.paramMap.get('operationId')) {
      if (this.route.snapshot.data.mode == 'spanish') {
        this.mode.spanish = true;
      } else {
        console.log(this.user);
        this.selected.operation = this.user.operationGroups[0].operations[0];
      }
    } else {
      // Sort by language
      this.operationService
        .getOperationByOperationId(this.route.snapshot.paramMap.get('operationId'))
        .subscribe((data: Operation) => {
          this.selected.operation = data[0];
        });
    }
  }

  handleDateFilterChangeEvent($event: string) {
    this.selected.filterDate = $event;
  }
  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
    this.patients$ = this.patientService.getPatientsByOperationId(this.selected.operation.operationId).pipe(
      map((patients: [Patient]) => {
        this.patients = patients;
        this._cdr.detectChanges();
        return patients;
      })
    );
  }
  ngOnDestroy() {
    this.patients = null;
  }
}
