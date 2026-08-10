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
        this.patientContacts = this.getDisplayPatientContacts(patientContacts);
        this.patientContacts.forEach(patientContact => {
          if (patientContact.patientContactPhoneNumber && patientContact.patientContactPhoneNumber.indexOf('-') == -1)
            patientContact.patientContactPhoneNumber = addStr(patientContact.patientContactPhoneNumber, 3, '-');
        });
      });
  }

  private getDisplayPatientContacts(patientContacts: PatientContact[] = []): PatientContact[] {
    var uniqueContacts = new Map<string, PatientContact>();

    patientContacts.forEach((patientContact: PatientContact) => {
      if (!this.hasDisplayablePatientContact(patientContact)) {
        return;
      }

      var contactKey = this.getPatientContactKey(patientContact);
      var existingPatientContact = uniqueContacts.get(contactKey);

      if (existingPatientContact) {
        uniqueContacts.set(contactKey, this.mergePatientContacts(existingPatientContact, patientContact));
        return;
      }

      uniqueContacts.set(contactKey, {
        ...patientContact,
        patientContactHIPAABoolean: this.isEnabled(patientContact?.patientContactHIPAABoolean),
        patientContactResponsiblePartyBoolean: this.isEnabled(patientContact?.patientContactResponsiblePartyBoolean)
      });
    });

    return Array.from(uniqueContacts.values());
  }

  private hasDisplayablePatientContact(patientContact: PatientContact): boolean {
    return Boolean(
      this.normalizeContactText(patientContact?.patientContactFirstName) ||
        this.normalizeContactText(patientContact?.patientContactLastName) ||
        this.normalizeContactText(patientContact?.patientContactRelationship) ||
        this.normalizeDigits(patientContact?.patientContactAreaCode) ||
        this.normalizeDigits(patientContact?.patientContactPhoneNumber)
    );
  }

  private getPatientContactKey(patientContact: PatientContact): string {
    return [
      this.normalizeContactText(patientContact?.patientContactFirstName),
      this.normalizeContactText(patientContact?.patientContactLastName),
      this.normalizeContactText(patientContact?.patientContactRelationship),
      this.normalizeDigits(patientContact?.patientContactCountryCode),
      this.normalizeDigits(patientContact?.patientContactAreaCode),
      this.normalizeDigits(patientContact?.patientContactPhoneNumber)
    ].join('|');
  }

  private normalizeContactText(value: string | number): string {
    if (value === null || typeof value === 'undefined') {
      return '';
    }

    return value.toString().trim().toLowerCase();
  }

  private mergePatientContacts(existingPatientContact: PatientContact, patientContact: PatientContact): PatientContact {
    return {
      ...existingPatientContact,
      patientContactFirstName:
        existingPatientContact.patientContactFirstName || patientContact.patientContactFirstName,
      patientContactLastName: existingPatientContact.patientContactLastName || patientContact.patientContactLastName,
      patientContactRelationship:
        existingPatientContact.patientContactRelationship || patientContact.patientContactRelationship,
      patientContactCountryCode:
        existingPatientContact.patientContactCountryCode || patientContact.patientContactCountryCode,
      patientContactAreaCode: existingPatientContact.patientContactAreaCode || patientContact.patientContactAreaCode,
      patientContactPhoneNumber:
        existingPatientContact.patientContactPhoneNumber || patientContact.patientContactPhoneNumber,
      patientContactHIPAABoolean:
        this.isEnabled(existingPatientContact.patientContactHIPAABoolean) ||
        this.isEnabled(patientContact.patientContactHIPAABoolean),
      patientContactResponsiblePartyBoolean:
        this.isEnabled(existingPatientContact.patientContactResponsiblePartyBoolean) ||
        this.isEnabled(patientContact.patientContactResponsiblePartyBoolean)
    };
  }

  private isEnabled(value: boolean | number | string): boolean {
    return value === true || value === 1 || value === '1';
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
