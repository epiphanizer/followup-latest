import { Component, OnInit } from '@angular/core';
import { PatientService, Patient } from '../../patient.service';
import { ActivatedRoute } from '@angular/router';
import { Operation } from '@app/modules/operation/operation.service';

@Component({
  providers: [PatientService],
  selector: 'app-patient-summary-widget',
  templateUrl: './patient-summary-widget.component.html',
  styleUrls: ['./patient-summary-widget.component.scss']
})
export class PatientSummaryWidgetComponent implements OnInit {
  currentYear: number;
  patient: Patient;
  operation: Operation;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.patient = this.route.snapshot.data.patient;
    this.currentYear = new Date().getFullYear();
  }
}
