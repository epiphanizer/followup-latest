import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { UserAvatarService } from './user-avatar.service';
import { User } from '../user';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

@Component({
  providers: [ToastrService],
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit {
  avatarUrl: SafeStyle;
  fileToUpload: File = null;
  @Input() user: User;
  @Output() userAvatarEventEmitter = new EventEmitter<boolean>();
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(
    private userAvatarService: UserAvatarService,
    private sanitizer: DomSanitizer,
    private toastrService: ToastrService
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

  clickUploadInput() {
    let element: HTMLElement = document.querySelector('#fileUpload') as HTMLElement;
    element.click();
  }
  uploadUserAvatarPhoto(files: FileList) {
    this.fileToUpload = files.item(0);
    this.userAvatarService.uploadUserAvatarByUserId(this.user.userId, this.fileToUpload).subscribe((data: any) => {
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
  }
}
