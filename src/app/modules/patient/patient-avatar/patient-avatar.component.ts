import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PatientAvatarService } from './patient-avatar.service';
import { Patient } from '../patient';

@Component({
  selector: 'app-patient-avatar',
  templateUrl: './patient-avatar.component.html',
  styleUrls: ['./patient-avatar.component.scss']
})
export class PatientAvatarComponent implements OnInit {
  avatarUrl: string;
  @Input() patient: Patient;
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(private patientAvatarService: PatientAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    var self = this;
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
      console.log(data);
      if (data !== null) {
        var reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = function() {
          var base64data = reader.result;
          console.log(base64data);
          self.avatarUrl = <string>base64data;
          self.avatarExists = true;
        };
      }
    });
  }
}
