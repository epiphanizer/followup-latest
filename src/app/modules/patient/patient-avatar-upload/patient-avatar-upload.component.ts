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
  styleUrls: ['./patient-avatar-upload.component.scss']
})
export class PatientAvatarUploadComponent implements OnInit {
  @Input() patient: Patient;
  avatarExists: Boolean;
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

  ngOnInit() {}

  clickUploadInput() {
    let element: HTMLElement = document.querySelector('#fileUpload') as HTMLElement;
    element.click();
    this.changingAvatar = true;
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

  // files: FileList
  uploadPatientAvatarPhoto(patient: Patient, files: FileList) {
    // this.fileToUpload = files.item(0);
    let fileName = files.item(0).name;
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompress = image;
      console.warn('Size in bytes was:', this.imageCompress.byteCount(image));

      this.imageCompress.compressFile(image, orientation, 50, 50).then(result => {
        this.imgResultAfterCompress = result;
        console.warn('Size in bytes is now:', this.imageCompress.byteCount(result));
        const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]);
        const imageFile = new File([imageBlob], fileName, { type: 'image/jpeg' });
        // this.fileToUpload. = imageBlob;
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
