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
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
      var uploadUrl = data[0].patientAvatarUploadPath;
      if (!uploadUrl) {
        this.avatarExists = false;
      } else {
        this.avatarUrl = uploadUrl;
        this.avatarExists = true;
      }
    });
  }
}
