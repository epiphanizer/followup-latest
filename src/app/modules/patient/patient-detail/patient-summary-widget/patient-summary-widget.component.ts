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
  expandAlternateNumbers: boolean = false;
  @Input() patient: Patient;
  constructor() {}

  ngOnInit() {}

  toggleAlternateNumbers() {
    if (this.expandAlternateNumbers == false) {
      this.expandAlternateNumbers = true;
    } else {
      this.expandAlternateNumbers = false;
    }
  }
}
