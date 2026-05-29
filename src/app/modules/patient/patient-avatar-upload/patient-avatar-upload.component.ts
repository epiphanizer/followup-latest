import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { PatientService } from '@app/modules/patient/patient.service';
import { PatientIntakeQuestionService } from '../patient-intake-question/patient-intake-question.service';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';

import { NgxImageCompressService } from 'ngx-image-compress';
import { PatientAvatarService } from '../patient-avatar/patient-avatar.service';
import { ToastrService } from 'ngx-toastr';
import { Patient } from '../patient';

@Component({
  providers: [NgxImageCompressService, PatientService, PatientIntakeQuestionService],
  selector: 'app-patient-avatar-upload',
  templateUrl: './patient-avatar-upload.component.html',
  styleUrls: ['./patient-avatar-upload.component.scss'],
  standalone: false
})
export class PatientAvatarUploadComponent implements OnInit {
  @Input() patient: Patient;
  @Input() avatarExists: Boolean;
  public avatarUrl: SafeStyle;
  changingAvatar: boolean = false;
  fileToUpload: File;
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;
  constructor(
    private imageCompress: NgxImageCompressService,
    private patientAvatarService: PatientAvatarService,
    private sanitizer: DomSanitizer,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    // See if we have an avatar to load in
    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
      var self = this;
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

  dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  uploadPatientAvatarPhoto() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompress = image;
      let fileName = this.patient.patientId + '-avatar';

      // we set orientation to 1 to handle exif data
      this.imageCompress.compressFile(image, 1, 50, 50).then(result => {
        this.imgResultAfterCompress = result;
        const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]);
        const imageFile = new File([imageBlob], fileName, { type: 'image/jpeg' });
        this.patientAvatarService
          .uploadPatientAvatarByPatientId(this.patient.patientId, imageFile)
          .subscribe((data: any) => {
            this.toastrService.success('Successfully uploaded patient avatar!');
            let self = this;
            this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
              var self = this;
              if (data !== null) {
                var reader = new FileReader();
                reader.readAsDataURL(data);
                reader.onloadend = function() {
                  var base64data = reader.result;
                  var store: any = '';
                  store = base64data;

                  sessionStorage.setItem(self.patient.patientId.toString(), store);
                  self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
                  self.avatarExists = true;
                  self.changingAvatar = false;
                };
              }
            });
          });
      });
    });
  }
}
