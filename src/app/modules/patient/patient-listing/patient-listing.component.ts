import { Component, OnInit, Input } from '@angular/core';
import { Operation } from '@app/modules/operation/operation';
import { Patient } from '@app/modules/patient/patient';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../patient.service';

@Component({
  selector: 'app-patient-listing',
  templateUrl: './patient-listing.component.html',
  styleUrls: ['./patient-listing.component.scss']
})
export class PatientListingComponent implements OnInit {
  @Input() operation: Operation;

  public patients: Patient[];
  public patients$: Observable<[Patient]> | void = null;
  public selected:
    | {
        operation: Operation;
        operation$: Observable<Operation>;
      }
    | any = {};
  user: User;
  constructor(private patientService: PatientService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.user.operations$.subscribe((data: Operation[]) => {
      /** Init to the first assigned operation alphabetically */
      this.selected.operation = data[0];
    });
  }

  operationChangeEventHandler($event: Operation) {
    this.selected.operation = $event;
    this.patients$ = this.patientService.getPatientListByOperationId(this.selected.operation.operationId).pipe(
      map((patients: [Patient]) => {
        this.patients = patients;
        return patients;
      })
    );
  }
}
