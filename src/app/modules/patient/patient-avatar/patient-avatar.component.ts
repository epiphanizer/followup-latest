import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PatientAvatarService } from './patient-avatar.service';
import { Patient } from '../patient';

@Component({
  selector: 'app-patient-avatar',
  templateUrl: './patient-avatar.component.html',
  styleUrls: ['./patient-avatar.component.scss']
})
export class PatientAvatarComponent implements OnInit {
  @Input() patient: Patient;
  /**
   * This guy is plaintext encoded base64
   */
  avatar: string;
  name = 'Test display image';
  thumbnail: any;
  constructor(private patientAvatarService: PatientAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((baseImage: any) => {
      //alert(JSON.stringify(data.image));
      let objectURL = 'data:image/jpeg;base64,' + baseImage.image;

      this.thumbnail = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    });
  }
}
