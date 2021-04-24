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
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
      if (data !== null) {
        var reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = function() {
          var base64data = reader.result;
          self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
          self.avatarExists = true;
        };
      }
    });
  }
}
