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
  avatarExists: boolean;
  constructor(private patientAvatarService: PatientAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((baseImage: any) => {
      if (!baseImage[0]) {
        this.avatarExists = false;
      } else {
        this.avatarExists = true;
        console.log(baseImage[0]);
        debugger;

        // @see https://medium.com/@koteswar.meesala/convert-array-buffer-to-base64-string-to-display-images-in-angular-7-4c443db242cd
        let TYPED_ARRAY = new Uint8Array(baseImage[0].avatarBlob.data);
        const STRING_CHAR = String.fromCharCode.apply(null, TYPED_ARRAY);
        let base64String = btoa(STRING_CHAR);
        this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + base64String);
        console.log(this.avatarUrl);
      }
    });
  }
}
