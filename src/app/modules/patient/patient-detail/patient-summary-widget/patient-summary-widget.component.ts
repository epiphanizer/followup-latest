import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '../../patient';
import { PatientService } from '../../patient.service';
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
  constructor() {}

  ngOnInit() {}
}
