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
  avatarUrl: SafeUrl;
  @Input() patient: Patient;
  /**
   * This guy is plaintext encoded base64
   */
  avatar: any;
  constructor(private patientAvatarService: PatientAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((baseImage: any) => {
      if (!baseImage.image) {
        this.avatar = false;
      } else {
        let unsafeImageUrl = URL.createObjectURL(this.patient.avatar);
        this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      }
    });
  }
}
