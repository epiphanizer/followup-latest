import { Component, OnInit, Input } from '@angular/core';
import { PatientService, Patient } from '../../patient.service';
import { Operation } from '@app/modules/operation/operation.service';

@Component({
  providers: [PatientService],
  selector: 'app-patient-summary-widget',
  templateUrl: './patient-summary-widget.component.html',
  styleUrls: ['./patient-summary-widget.component.scss']
})
export class PatientSummaryWidgetComponent implements OnInit {
  @Input() patient: Patient;
  @Input() operation: Operation;
  currentYear: number;
  constructor() {}

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
  }
}
