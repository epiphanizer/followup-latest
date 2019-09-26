import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PatientAvatarServiceService } from './patient-avatar.service';

@Component({
  selector: 'app-patient-avatar',
  templateUrl: './patient-avatar.component.html',
  styleUrls: ['./patient-avatar.component.scss']
})
export class PatientAvatarComponent implements OnInit {
  name = 'Test display image';
  thumbnail: any;
  constructor(private patientAvatarService: PatientAvatarService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.config.getData().subscribe((baseImage: any) => {
      //alert(JSON.stringify(data.image));
      let objectURL = 'data:image/jpeg;base64,' + baseImage.image;

      this.thumbnail = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    });
    //console.log(this.setting.snippet)
  }
}
