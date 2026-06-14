import { Component, OnInit, OnChanges, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { UserAvatarService } from './user-avatar.service';
import { User } from '../user';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Router } from '@angular/router';

@Component({
  providers: [ToastrService, NgxImageCompressService],
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  standalone: false
})
export class UserAvatarComponent implements OnInit, OnChanges {
  avatarUrl: SafeStyle;
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;
  isCircle: boolean = false;
  private lastRequestedUserId: string | null = null;
  @Input() user: User;
  @Output() userAvatarEventEmitter = new EventEmitter<boolean>();
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean = false;
  teamProfile: boolean = false;
  constructor(
    private imageCompress: NgxImageCompressService,
    private route: Router,
    private sanitizer: DomSanitizer,
    private toastrService: ToastrService,
    private userAvatarService: UserAvatarService
  ) {}

  ngOnInit() {
    /**
     * See if we are on the team profile page
     */
    if (this.route.url.includes('team')) {
      this.teamProfile = true;
    }
    this.loadAvatar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.loadAvatar();
    }
  }

  private loadAvatar() {
    const userId = this.user?.userId || null;
    if (!userId) {
      this.avatarExists = false;
      this.avatarUrl = undefined;
      this.lastRequestedUserId = null;
      return;
    }

    if (this.lastRequestedUserId === userId) {
      return;
    }

    this.lastRequestedUserId = userId;
    this.userAvatarService.getUserAvatarByUserId(userId).subscribe((data: any) => {
      var self = this;
      self.avatarExists = data !== null;

      if (data !== null) {
        var reader = new FileReader();
        reader.readAsDataURL(data);
        var self = this;
        reader.onloadend = function() {
          var base64data = reader.result;
          self.avatarUrl = self.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
        };
        return;
      }

      self.avatarUrl = undefined;
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
      console.log('uploading avatar photo');
      console.log(image);
      this.imgResultBeforeCompress = image;
      let fileName = this.user.userId + '-avatar';
      // we set orientation to 1 to handle exif data
      this.imageCompress.compressFile(image, 1, 50, 50).then(result => {
        this.imgResultAfterCompress = result;
        const imageBlob = this.dataURItoBlob(this.imgResultAfterCompress.split(',')[1]);
        const imageFile = new File([imageBlob], fileName, {
          type: 'image/jpeg'
        });
        this.userAvatarService.uploadUserAvatarByUserId(this.user.userId, imageFile).subscribe((data: any) => {
          this.toastrService.success('Successfully uploaded user avatar!');
          this.userAvatarEventEmitter.emit(true);
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
        });
      });
    });
  }
}
