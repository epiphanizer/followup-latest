import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PatientAvatarService } from './patient-avatar.service';
import { Patient } from '../patient';

@Component({
  selector: 'app-patient-avatar',
  templateUrl: './patient-avatar.component.html',
  styleUrls: ['./patient-avatar.component.scss']
})
export class PatientAvatarComponent implements OnInit {
  avatarUrl: SafeStyle;
  isCircle: boolean = false;
  @Input() patient: Patient;
  @Input() type: string;
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(private patientAvatarService: PatientAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    var self = this;
    if (this.type == 'circle') {
      this.isCircle = true;
    }
    var store: any = {
      patients: {}
    };
    if (sessionStorage.getItem('patientAvatarStore')) {
      // check if we already have the data stored
      let store = sessionStorage.getItem('patientAvatarStore');
      var storeDeserialized = JSON.parse(store);
      if (storeDeserialized.patients[this.patient.patientId]) {
        if (storeDeserialized.patients[this.patient.patientId].avatar.length) {
          self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(
            `url(${storeDeserialized.patients[this.patient.patientId].avatar})`
          );
          self.avatarExists = true;
        }
      }
    } else {
      this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
        store.patients[this.patient.patientId] = {
          avatar: ''
        };

        if (data !== null) {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = function() {
            var base64data = reader.result;
            store.patients[self.patient.patientId].avatar = base64data;
            sessionStorage.setItem('patientAvatarStore', JSON.stringify(store));

            self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
            self.avatarExists = true;
          };
        }
      });
    }
  }
}
