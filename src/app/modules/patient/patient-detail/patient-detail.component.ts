import { Component, OnInit, ViewChild } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCall, PatientCallService } from '../patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/user';
import { Operation, OperationService } from '@app/modules/operation/operation.service';
import { IonTextarea } from '@ionic/angular';

@Component({
  providers: [PatientCallService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  @ViewChild('ion-textarea') patientNotesInput: IonTextarea;
  user: User;
  patient: Patient;
  operation: Operation;
  selected: {
    patientCall: PatientCall | null;
    patientContactNumberId: number | null;
  } = {
    patientCall: null,
    patientContactNumberId: null
  };
  patientCall: PatientCall | null = null;
  patientCall$: Observable<PatientCall>;
  constructor(
    private operationService: OperationService,
    private patientCallService: PatientCallService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    var operationId = this.route.snapshot.params.operationId;
    this.user = this.route.snapshot.data.user;
    this.operationService.getOperationByOperationId(operationId).subscribe((operation: Operation) => {
      this.operation = operation;
      return operation;
    });
    this.patient = this.route.snapshot.data.patient;
  }

  patientCallStartEventHandler($event: PatientCall) {
    this.selected.patientCall = $event;
    this.patientCallService.startPatientCall(this.patientCall.patientCallId);
  }

  patientCallEndEventHandler($event: number) {
    this.selected.patientCall.patientCallStatusLabelId = $event;
    this.patientCallService.endPatientCall(this.patientCall.patientCallId);
  }
  patientCallFinishEventHandler($event: number) {
    this.selected.patientCall.patientCallStatusLabelId = $event;
    this.patientCallService.finalizePatientCall(this.patientCall.patientCallId, $event);
  }
}
