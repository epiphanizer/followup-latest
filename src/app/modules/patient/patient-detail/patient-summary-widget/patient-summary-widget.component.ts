import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '../../patient';
import { PatientService } from '../../patient.service';
import { PatientContactService } from '../../patient-contact/patient-contact.service';
import { PatientContact } from '../../patient-contact/patient-contact';

@Component({
  providers: [PatientService, PatientContactService],
  selector: 'app-patient-summary-widget',
  templateUrl: './patient-summary-widget.component.html',
  styleUrls: ['./patient-summary-widget.component.scss']
})
export class PatientSummaryWidgetComponent implements OnInit {
  expandAlternateNumbers: boolean = false;
  @Input() patient: Patient;
  patientContacts: PatientContact[];
  constructor(private patientContactService: PatientContactService) {}

  ngOnInit() {
    this.patientContactService
      .getPatientContactsByPatientId(this.patient.patientId)
      .subscribe((patientContacts: PatientContact[]) => {
        this.patientContacts = patientContacts;
      });
  }

  toggleAlternateNumbers() {
    if (this.expandAlternateNumbers == false) {
      this.expandAlternateNumbers = true;
    } else {
      this.expandAlternateNumbers = false;
    }
  }
}
