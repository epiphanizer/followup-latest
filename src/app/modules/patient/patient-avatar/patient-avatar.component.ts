import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PatientAvatarService } from './patient-avatar.service';
import { Patient } from '../patient';
import { delay } from 'rxjs/operators';

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
    var store: any = '';
    if (localStorage.getItem(self.patient.patientId.toString())) {
      var storeDeserialized = localStorage.getItem(self.patient.patientId.toString());
      if (storeDeserialized.length) {
        self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${storeDeserialized})`);
        self.avatarExists = true;
      }
    } else {
      this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
        if (data !== null && !data.errno) {
          var reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = function() {
            var base64data = reader.result;
            store = base64data;
            try {
              localStorage.setItem(self.patient.patientId.toString(), store);
            } catch (error) {
              console.log('hit an error in session storage (memory), clear and restart the process');
              localStorage.clear();
              localStorage.setItem(self.patient.patientId.toString(), store);
            }
            self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
            self.avatarExists = true;
          };
        } else {
          localStorage.setItem(self.patient.patientId.toString(), '');
        }
      });
    }
  }
}
