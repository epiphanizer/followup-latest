import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '../../patient';
import { PatientService } from '../../patient.service';
import { PatientContactService } from '../../patient-contact/patient-contact.service';
import { PatientContact } from '../../patient-contact/patient-contact';

@Component({
  providers: [PatientService, PatientContactService],
  selector: 'app-patient-summary-widget',
  templateUrl: './patient-summary-widget.component.html',
  styleUrls: ['./patient-summary-widget.component.scss'],
  standalone: false
})
export class PatientSummaryWidgetComponent implements OnInit {
  expandAlternateNumbers: boolean = false;
  @Input() patient: Patient;
  patientContacts: PatientContact[];
  patientDisplayPhone: string = '';
  constructor(private patientContactService: PatientContactService) {}

  ngOnInit() {
    function addStr(str: string, index: number, stringToAdd: string) {
      return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
    }

    this.patientDisplayPhone = this.getPatientDisplayPhone(this.patient);

    this.patientContactService
      .getPatientContactsByPatientId(this.patient.patientId)
      .subscribe((patientContacts: PatientContact[]) => {
        this.patientContacts = patientContacts;
        this.patientContacts.forEach(patientContact => {
          if (patientContact.patientContactPhoneNumber && patientContact.patientContactPhoneNumber.indexOf('-') == -1)
            patientContact.patientContactPhoneNumber = addStr(patientContact.patientContactPhoneNumber, 3, '-');
        });
      });
  }

  private normalizeDigits(value: string | number): string {
    if (value === null || typeof value === 'undefined') {
      return '';
    }
    return value
      .toString()
      .replace(/[^0-9]/g, '')
      .trim();
  }

  private formatLocalPhone(phoneDigits: string): string {
    if (!phoneDigits) {
      return '';
    }

    if (phoneDigits.length === 7) {
      return phoneDigits.substr(0, 3) + '-' + phoneDigits.substr(3);
    }

    if (phoneDigits.length === 10) {
      return phoneDigits.substr(0, 3) + '-' + phoneDigits.substr(3, 3) + '-' + phoneDigits.substr(6);
    }

    if (phoneDigits.length > 3) {
      return phoneDigits.substr(0, 3) + '-' + phoneDigits.substr(3);
    }

    return phoneDigits;
  }

  private getPatientDisplayPhone(patient: Patient): string {
    if (!patient) {
      return '';
    }

    var countryCode = this.normalizeDigits(patient.patientCountryCode);
    var areaCode = this.normalizeDigits(patient.patientAreaCode);
    var phoneNumber = this.normalizeDigits(patient.patientPhoneNumber);

    if (!areaCode && phoneNumber.length === 10) {
      areaCode = phoneNumber.substr(0, 3);
      phoneNumber = phoneNumber.substr(3);
    }

    if ((!countryCode || !areaCode) && phoneNumber.length === 11 && phoneNumber.charAt(0) == '1') {
      if (!countryCode) {
        countryCode = '1';
      }
      if (!areaCode) {
        areaCode = phoneNumber.substr(1, 3);
      }
      phoneNumber = phoneNumber.substr(4);
    }

    if (areaCode && phoneNumber.length === 10 && phoneNumber.substr(0, 3) == areaCode) {
      phoneNumber = phoneNumber.substr(3);
    }

    var localPhone = this.formatLocalPhone(phoneNumber);

    if (!localPhone) {
      return '';
    }
    if (countryCode && areaCode) {
      return countryCode + '-' + areaCode + '-' + localPhone;
    }
    if (areaCode) {
      return areaCode + '-' + localPhone;
    }
    if (countryCode) {
      return countryCode + '-' + localPhone;
    }

    return localPhone;
  }

  toggleAlternateNumbers() {
    if (this.expandAlternateNumbers == false) {
      this.expandAlternateNumbers = true;
    } else {
      this.expandAlternateNumbers = false;
    }
  }
}
