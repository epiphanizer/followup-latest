import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { UserAvatarService } from './user-avatar.service';
import { User } from '../user';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  providers: [ToastrService],
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {
  avatarUrl: SafeStyle;
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;
  @Input() user: User;
  @Output() userAvatarEventEmitter = new EventEmitter<boolean>();
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(
    private imageCompress: NgxImageCompressService,
    private sanitizer: DomSanitizer,
    private toastrService: ToastrService,
    private userAvatarService: UserAvatarService
  ) {}

  ngOnInit() {
    this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((data: any) => {
      var self = this;
      if (data !== null) {
        var reader = new FileReader();
        reader.readAsDataURL(data);
        var self = this;
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
    const blob = new Blob([int8Array], {
      type: 'image/jpeg'
    });
    return blob;
  }

  uploadUserAvatarPhoto() {
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompress = image;
      let fileName = this.user.userId + '-avatar';
      this.imageCompress.compressFile(image, orientation, 50, 50).then(result => {
        this.imgResultAfterCompress = result;
        const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]);
        const imageFile = new File([imageBlob], fileName, {
          type: 'image/jpeg'
        });
        this.userAvatarService.uploadUserAvatarByUserId(this.user.userId, imageFile).subscribe((data: any) => {
          this.toastrService.success('Successfully uploaded user avatar!');
          this.userAvatarEventEmitter.emit(true);
          this.userAvatarService.getUserAvatarByUserId(this.user.userId).subscribe((data: any) => {
            if (data !== null) {
              var uploadUrl = data[0].userAvatarUploadPath;
              if (!uploadUrl) {
                this.avatarExists = false;
              } else {
                this.avatarUrl = uploadUrl;
                this.avatarExists = true;
              }
            }
          });
        });
      });
    });
  }
}
